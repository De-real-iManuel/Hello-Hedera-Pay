from __future__ import annotations

import httpx
from app.config import settings

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

_PRIMARY_PROMPT_TEMPLATE = """\
You are a research analyst specializing in uncovering hidden, non-obvious, and underreported facts.

Topic: {topic}

Source material:
{source_excerpts}

Extract exactly 3 to 5 hidden or non-obvious facts about the topic from the source material above.
For each fact, provide:
- A concise title (max 200 characters)
- A detailed summary (max 1000 characters)
- A confidence score (0.0 to 1.0) reflecting your certainty
- The source URLs that support this fact

Respond ONLY with a valid JSON array in this exact format:
[
  {{
    "id": "<uuid>",
    "title": "<title>",
    "summary": "<summary>",
    "confidence": <float>,
    "sources": ["<url>", ...]
  }}
]\
"""

_RETRY_PROMPT_TEMPLATE = """\
Return ONLY a valid JSON array of fact objects. Each object must have:
id (string), title (string), summary (string), confidence (float 0-1), sources (array of strings).
No markdown, no explanation, just the JSON array.

Topic: {topic}\
"""


class LLMError(Exception):
    pass


async def extract_facts(topic: str, sources: list[dict]) -> str:
    lines = []
    for i, s in enumerate(sources, 1):
        url = s.get("url", "unknown")
        excerpt = s.get("content") or s.get("excerpt") or ""
        lines.append(f"[{i}] {url}\n{excerpt.strip()}" if excerpt else f"[{i}] {url}")
    prompt = _PRIMARY_PROMPT_TEMPLATE.format(topic=topic, source_excerpts="\n\n".join(lines) or "(no sources)")
    return await _call_openrouter(prompt)


async def extract_facts_retry(topic: str) -> str:
    return await _call_openrouter(_RETRY_PROMPT_TEMPLATE.format(topic=topic))


async def _call_openrouter(prompt: str) -> str:
    headers = {"Authorization": f"Bearer {settings.openrouter_api_key}", "Content-Type": "application/json"}
    payload = {"model": settings.openrouter_model, "messages": [{"role": "user", "content": prompt}], "max_tokens": 4096}
    try:
        async with httpx.AsyncClient(timeout=55.0) as client:
            response = await client.post(OPENROUTER_URL, headers=headers, json=payload)
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise LLMError(f"OpenRouter API returned HTTP {exc.response.status_code}: {exc.response.text}") from exc
    except httpx.RequestError as exc:
        raise LLMError(f"Network error calling OpenRouter API: {exc}") from exc

    data = response.json()
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as exc:
        raise LLMError(f"Unexpected OpenRouter response structure: {data}") from exc
