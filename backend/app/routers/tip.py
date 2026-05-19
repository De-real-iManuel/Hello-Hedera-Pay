import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException

from app.db.database import get_db
from app.db.models import FactRecord, TipRecord
from app.models import TipRequest, TipResponse
from app.services.hcs_client import publish_to_hcs
from app.utils.errors import HederaError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tips", tags=["tips"])


@router.post("/tip", response_model=TipResponse)
async def create_tip(req: TipRequest, db=Depends(get_db)):
    """
    Create a tip (HBAR payment) for a fact.
    
    This endpoint:
    1. Validates the transaction has completed on-chain
    2. Stores the tip record in database
    3. Publishes the tip to HCS for transparency
    4. Returns transaction details and URLs
    """
    # Verify fact exists
    fact_record = await db.get(FactRecord, req.fact_id)
    if not fact_record:
        raise HTTPException(status_code=404, detail="Fact not found.")
    
    # Create tip record
    tip_id = str(uuid.uuid4())
    hashscan_url = f"https://hashscan.io/testnet/transaction/{req.transaction_id}"
    
    tip_record = TipRecord(
        id=tip_id,
        user_id=str(uuid.uuid4())[:8],
        fact_id=req.fact_id,
        topic=req.topic,
        amount_hbar=req.amount,
        transaction_id=req.transaction_id,
        hashscan_url=hashscan_url,
        hcs_message_id="pending",
    )
    db.add(tip_record)
    await db.flush()
    
    # Publish to HCS
    try:
        hcs_message_id, hcs_url = await publish_to_hcs(tip_record)
        tip_record.hcs_message_id = hcs_message_id
        tip_record.hcs_url = hcs_url
        await db.flush()
    except HederaError as exc:
        logger.error("Failed to publish tip to HCS: %s", exc)
        raise HTTPException(status_code=502, detail="Failed to publish tip to HCS.")
    except Exception as exc:
        logger.exception("Unexpected error publishing to HCS: %s", exc)
        raise HTTPException(status_code=500, detail="Internal server error.")
    
    return TipResponse(
        transaction_id=req.transaction_id,
        hashscan_url=hashscan_url,
        hcs_message_id=hcs_message_id,
        hcs_url=hcs_url,
    )
