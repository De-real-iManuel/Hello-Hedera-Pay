"""
POST /analyze

Runs the AI research pipeline, persists the query and facts to SQLite,
and returns the extracted facts. No authentication required.
"""

from __future__ import annotations

import asyncio
import json
import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import FactRecord, QueryRecord
from app.models import AnalyzeRequest, AnalyzeResponse
from app.services.ai_agent import run as run_pipeline
from app.services.tavily_client import TavilyError
from app.utils.errors import sanitize_error

logger = logging.getLogger(__name__)

router = APIRouter(tags=["analyze"])


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    request: AnalyzeRequest,
    db: AsyncSession = Depends(get_db),
) -> AnalyzeResponse:
    """
    Analyze a topic using the AI research pipeline and persist results.

    Runs Tavily web search + LLM extraction with a 60-second timeout.
    Returns up to 5 facts sorted by confidence descending.
    """
    try:
        facts = await asyncio.wait_for(run_pipeline(request.topic), timeout=60.0)
    except asyncio.TimeoutError:
        raise HTTPException(status_code=503, detail="Analysis timed out. Please try again.")
    except TavilyError:
        raise HTTPException(status_code=502, detail="Web search failed. Please try again.")
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("analyze error: %s", exc)
        raise HTTPException(status_code=500, detail=sanitize_error(exc))

    query_record = QueryRecord(
        id=str(uuid.uuid4()),
        user_id="anonymous",
        topic=request.topic,
        fact_count=len(facts),
    )
    db.add(query_record)

    for fact in facts:
        db.add(FactRecord(
            id=fact.id,
            query_id=query_record.id,
            title=fact.title,
            summary=fact.summary,
            confidence=fact.confidence,
            sources=json.dumps(fact.sources),
            category=request.topic,
        ))

    return AnalyzeResponse(facts=facts)
