"""
GET /history/queries  — recent queries with their facts
GET /history/tips     — tips made by the authenticated user
GET /history/tips/total — aggregate tip stats for the authenticated user

All endpoints require Supabase JWT authentication.
"""

from __future__ import annotations

import json
import logging

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth import get_current_user_id
from app.db.database import get_db
from app.db.models import QueryRecord, TipRecord

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/history", tags=["history"])


@router.get("/queries")
async def get_queries(
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> list[dict]:
    """Return the most recent queries with their facts, newest first."""
    result = await db.execute(
        select(QueryRecord)
        .where(QueryRecord.user_id == user_id)
        .options(selectinload(QueryRecord.facts))
        .order_by(QueryRecord.created_at.desc())
        .limit(limit)
    )
    rows = result.scalars().all()

    return [
        {
            "id": q.id,
            "topic": q.topic,
            "fact_count": q.fact_count,
            "created_at": q.created_at.isoformat(),
            "facts": [
                {
                    "id": f.id,
                    "title": f.title,
                    "summary": f.summary,
                    "confidence": f.confidence,
                    "sources": json.loads(f.sources or "[]"),
                    "category": f.category,
                    "created_at": f.created_at.isoformat(),
                }
                for f in q.facts
            ],
        }
        for q in rows
    ]


@router.get("/tips")
async def get_tips(
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> list[dict]:
    """Return tips made by the authenticated user, newest first."""
    result = await db.execute(
        select(TipRecord)
        .where(TipRecord.user_id == user_id)
        .order_by(TipRecord.created_at.desc())
        .limit(limit)
    )
    rows = result.scalars().all()

    return [
        {
            "id": t.id,
            "fact_id": t.fact_id,
            "topic": t.topic,
            "amount_hbar": t.amount_hbar,
            "transaction_id": t.transaction_id,
            "hashscan_url": t.hashscan_url,
            "hcs_message_id": t.hcs_message_id,
            "hcs_url": t.hcs_url,
            "created_at": t.created_at.isoformat(),
        }
        for t in rows
    ]


@router.get("/tips/total")
async def get_tips_total(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Return total HBAR tipped and tip count for the authenticated user."""
    result = await db.execute(
        select(TipRecord).where(TipRecord.user_id == user_id)
    )
    tips = result.scalars().all()
    return {
        "total_hbar": sum(t.amount_hbar for t in tips),
        "count": len(tips),
    }
