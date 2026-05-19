from __future__ import annotations

import httpx
from app.config import settings

TAVILY_URL = "https://api.tavily.com/search"


class TavilyError(Exception):
    pass


async def search(topic: str) -> list[dict]:
    payload = {"api_key": settings.tavily_api_key, "query": topic, "max_results": 5, "search_depth": "advanced"}
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(TAVILY_URL, json=payload)
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise TavilyError(f"Tavily API error {exc.response.status_code}") from exc
    except httpx.RequestError as exc:
        raise TavilyError(f"Network error: {exc}") from exc

    data = response.json()
    return data.get("results", [])
