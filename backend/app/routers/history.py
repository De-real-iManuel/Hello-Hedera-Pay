import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select

from app.db.database import get_db
from app.db.models import QueryRecord, TipRecord
from app.models import Fact

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("/queries")
async def get_queries(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100), db=Depends(get_db)):
    """Retrieve recent analysis queries."""
    try:
        stmt = select(QueryRecord).offset(skip).limit(limit).order_by(QueryRecord.created_at.desc())
        result = await db.execute(stmt)
        queries = result.scalars().all()
        return [
            {
                "id": q.id,
                "topic": q.topic,
                "fact_count": q.fact_count,
                "created_at": q.created_at.isoformat(),
            }
            for q in queries
        ]
    except Exception as exc:
        logger.error("Error fetching queries: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to fetch queries.")


@router.get("/tips")
async def get_tips(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100), db=Depends(get_db)):
    """Retrieve recent tips."""
    try:
        stmt = select(TipRecord).offset(skip).limit(limit).order_by(TipRecord.created_at.desc())
        result = await db.execute(stmt)
        tips = result.scalars().all()
        return [
            {
                "id": t.id,
                "fact_id": t.fact_id,
                "amount_hbar": t.amount_hbar,
                "transaction_id": t.transaction_id,
                "hashscan_url": t.hashscan_url,
                "hcs_message_id": t.hcs_message_id,
                "created_at": t.created_at.isoformat(),
            }
            for t in tips
        ]
    except Exception as exc:
        logger.error("Error fetching tips: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to fetch tips.")


@router.get("/tips/total")
async def get_total_tips(db=Depends(get_db)):
    """Get total HBAR tipped across all tips."""
    try:
        stmt = select(TipRecord)
        result = await db.execute(stmt)
        tips = result.scalars().all()
        total_hbar = sum(t.amount_hbar for t in tips)
        count = len(tips)
        return {"total_hbar": total_hbar, "count": count}
    except Exception as exc:
        logger.error("Error computing tip totals: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to compute totals.")
