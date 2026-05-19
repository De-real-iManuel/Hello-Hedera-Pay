import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException

from app.db.database import get_db
from app.db.models import FactRecord, QueryRecord
from app.models import AnalyzeRequest, AnalyzeResponse, Fact
from app.services.ai_agent import run as analyze_topic

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analyze", tags=["analyze"])


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest, db=Depends(get_db)):
    """
    Analyze a topic and extract facts using AI agent.
    
    This endpoint:
    1. Searches the web for sources using Tavily
    2. Extracts facts using LLM
    3. Stores facts in database
    4. Returns calibrated facts with confidence scores
    """
    try:
        facts = await analyze_topic(req.topic)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unexpected error during analysis: %s", exc)
        raise HTTPException(status_code=500, detail="Internal server error during analysis.")

    # Store in database
    user_id = str(uuid.uuid4())[:8]  # simplified user tracking
    
    query_record = QueryRecord(
        id=str(uuid.uuid4()),
        user_id=user_id,
        topic=req.topic,
        fact_count=len(facts),
    )
    db.add(query_record)
    
    fact_records = []
    for fact in facts:
        fact_record = FactRecord(
            id=fact.id,
            query_id=query_record.id,
            title=fact.title,
            summary=fact.summary,
            confidence=fact.confidence,
            sources=",".join(fact.sources),
        )
        fact_records.append(fact_record)
        db.add(fact_record)
    
    await db.flush()
    
    return AnalyzeResponse(facts=facts)
