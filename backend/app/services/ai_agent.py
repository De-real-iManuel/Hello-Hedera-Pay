from __future__ import annotations

import json
import logging

from fastapi import HTTPException
from pydantic import ValidationError

from app.models import Fact
from app.services.llm_client import LLMError, extract_facts, extract_facts_retry
from app.services.tavily_client import TavilyError, search

logger = logging.getLogger(__name__)


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

    try:
        sources = await search(stripped)
    except TavilyError as exc:
        logger.error("Tavily search failed: %s", exc)
        raise HTTPException(status_code=502, detail="Web search failed. Please try again.")

    try:
        raw = await extract_facts(stripped, sources)
    except LLMError as exc:
        logger.error("LLM extraction failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to extract facts from LLM response.")

    facts = None
    try:
        facts = _parse_llm_response(raw)
    except ValueError as exc:
        logger.warning("Primary parse failed: %s — retrying", exc)

    if facts is None:
        try:
            retry_raw = await extract_facts_retry(stripped)
            facts = _parse_llm_response(retry_raw)
        except (LLMError, ValueError) as exc:
            logger.error("Retry also failed: %s", exc)
            raise HTTPException(status_code=500, detail="Failed to extract facts from LLM response.")

    calibrated = [
        Fact(id=f.id, title=f.title, summary=f.summary, confidence=compute_confidence(f.confidence, f.sources), sources=f.sources)
        for f in facts
    ]
    calibrated.sort(key=lambda f: f.confidence, reverse=True)
    return calibrated[:5]
