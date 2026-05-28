from __future__ import annotations

import importlib.util
import json
import logging

from fastapi import HTTPException
from pydantic import ValidationError

from app.models import Fact
from app.services.llm_client import LLMError, extract_facts, extract_facts_retry
from app.services.tavily_client import TavilyError, search

logger = logging.getLogger(__name__)


def _agent_kit_available() -> bool:
    return importlib.util.find_spec("hedera_agent_kit") is not None


async def _extract_facts_with_agent_kit(topic: str, sources: list[dict]) -> list[Fact]:
    """
    Use Hedera Agent Kit + LangChain ReAct agent to research a topic,
    extract facts, and optionally publish them to HCS.

    Returns a list of Fact objects annotated with agent_run_id / hcs_topic_id
    when the kit publishes to HCS during its run.
    """
    if not _agent_kit_available():
        raise RuntimeError("Hedera Agent Kit is not installed in the current environment")

    from app.config import settings

    hedera_agent_kit = importlib.import_module("hedera_agent_kit")
    HederaAgentKit = getattr(hedera_agent_kit, "HederaAgentKit")

    # Initialise the kit with operator credentials from our config
    kit = HederaAgentKit(
        operator_account_id=settings.hedera_account_id,
        operator_private_key=settings.hedera_private_key,
        network=settings.hedera_network,
    )

    # Get LangChain-compatible tools from the kit
    tools = kit.get_tools()

    # Build the ReAct agent using langgraph
    langgraph_prebuilt = importlib.import_module("langgraph.prebuilt")
    create_react_agent = getattr(langgraph_prebuilt, "create_react_agent")

    langchain_openai = importlib.import_module("langchain_openai")
    ChatOpenAI = getattr(langchain_openai, "ChatOpenAI")

    llm = ChatOpenAI(
        model=settings.openrouter_model,
        openai_api_key=settings.openrouter_api_key,
        openai_api_base="https://openrouter.ai/api/v1",
        temperature=0.2,
    )

    agent = create_react_agent(llm, tools)

    # Format the search sources as excerpts for the agent
    lines = []
    for i, s in enumerate(sources, 1):
        url = s.get("url", "unknown")
        excerpt = s.get("content") or s.get("excerpt") or ""
        lines.append(f"[{i}] {url}\n{excerpt.strip()}" if excerpt else f"[{i}] {url}")
    source_excerpts = "\n\n".join(lines) or "(no sources)"

    agent_prompt = (
        "You are a research analyst specialising in uncovering hidden, non-obvious facts.\n\n"
        f"Topic: {topic}\n\n"
        f"Source material:\n{source_excerpts}\n\n"
        "Extract exactly 3 to 5 hidden or non-obvious facts from the source material above. For each fact provide:\n"
        "- id: a unique UUID string\n"
        "- title: concise title (max 200 chars)\n"
        "- summary: detailed summary (max 1000 chars)\n"
        "- confidence: float 0.0-1.0 reflecting your certainty\n"
        "- sources: list of source URL strings\n\n"
        "If you have an HCS topic submission tool available, publish a summary message "
        f"to topic {settings.hcs_topic_id} with the research results.\n\n"
        "Respond with ONLY a valid JSON array of fact objects. No markdown fences, no explanation."
    )

    import uuid as _uuid
    run_id = str(_uuid.uuid4())

    result = await agent.ainvoke({"messages": [("user", agent_prompt)]})

    # Extract the final assistant message content
    messages = result.get("messages", [])
    raw_content = ""
    for msg in reversed(messages):
        content = getattr(msg, "content", None) or ""
        if content.strip():
            raw_content = content.strip()
            break

    if not raw_content:
        raise RuntimeError("Agent Kit agent returned empty response")

    facts = _parse_llm_response(raw_content)

    # Annotate facts with the agent run ID and HCS topic
    annotated = []
    for f in facts:
        annotated.append(Fact(
            id=f.id,
            title=f.title,
            summary=f.summary,
            confidence=f.confidence,
            sources=f.sources,
            agent_run_id=run_id,
            hcs_topic_id=settings.hcs_topic_id,
        ))

    logger.info("Agent Kit produced %d facts (run_id=%s)", len(annotated), run_id)
    return annotated


def compute_confidence(llm_self_score: float, source_urls: list[str]) -> float:
    distinct = len(set(source_urls))
    if distinct >= 3:
        score = max(0.60, llm_self_score)
    elif distinct == 2:
        score = max(0.46, min(0.59, llm_self_score))
    else:
        score = min(0.45, llm_self_score)
    return round(score, 2)


def _parse_llm_response(raw: str) -> list[Fact]:
    text = raw.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        inner = []
        for line in lines[1:]:
            if line.strip() == "```":
                break
            inner.append(line)
        text = "\n".join(inner).strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"JSON decode error: {exc}") from exc
    if not isinstance(data, list):
        raise ValueError(f"Expected JSON array, got {type(data).__name__}")
    facts = []
    for item in data:
        try:
            facts.append(Fact(**item))
        except (ValidationError, TypeError) as exc:
            raise ValueError(f"Fact validation error: {exc}") from exc
    return facts


async def run(topic: str) -> list[Fact]:
    stripped = topic.strip()
    if not stripped or len(stripped) < 8 or len(stripped) > 500:
        raise HTTPException(status_code=422, detail="topic must be between 8 and 500 characters")

    # 1. Search Tavily first (shared search)
    try:
        sources = await search(stripped)
    except TavilyError as exc:
        logger.error("Tavily search failed: %s", exc)
        raise HTTPException(status_code=502, detail="Web search failed. Please try again.")

    # 2. Extract facts (using Agent Kit if available, otherwise direct LLM)
    facts = None
    if _agent_kit_available():
        try:
            import asyncio
            facts = await asyncio.wait_for(_extract_facts_with_agent_kit(stripped, sources), timeout=20.0)
        except Exception as exc:
            logger.warning("Agent Kit execution failed: %s — falling back to Tavily+LLM", exc)

    if facts is None:
        try:
            raw = await extract_facts(stripped, sources)
            facts = _parse_llm_response(raw)
        except Exception as exc:
            logger.warning("Primary direct parse failed: %s — retrying", exc)

    if facts is None:
        try:
            retry_raw = await extract_facts_retry(stripped)
            facts = _parse_llm_response(retry_raw)
        except (LLMError, ValueError) as exc:
            logger.error("Retry also failed: %s", exc)
            raise HTTPException(status_code=500, detail="Failed to extract facts from LLM response.")

    calibrated = [
        Fact(
            id=f.id,
            title=f.title,
            summary=f.summary,
            confidence=compute_confidence(f.confidence, f.sources),
            sources=f.sources,
            agent_run_id=getattr(f, "agent_run_id", None),
            hcs_topic_id=getattr(f, "hcs_topic_id", None),
        )
        for f in facts
    ]
    calibrated.sort(key=lambda f: f.confidence, reverse=True)
    return calibrated[:5]

