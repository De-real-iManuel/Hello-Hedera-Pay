"""
POST /tip

Validates the transaction ID, publishes a receipt to HCS (best-effort),
persists the tip to SQLite, and returns verification URLs.
Requires Supabase JWT authentication.
"""

from __future__ import annotations

import logging
import re
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user_id
from app.config import settings
from app.db.database import get_db
from app.db.models import FactRecord, TipRecord
from app.models import TipRequest, TipResponse
from app.services import hcs_client
from app.services.hcs_client import HCSError

logger = logging.getLogger(__name__)

router = APIRouter(tags=["tip"])

_TRANSACTION_ID_RE = re.compile(r"^0\.0\.\d+@\d+\.\d+$")


@router.post("/tip", response_model=TipResponse)
async def tip(
    request: TipRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> TipResponse:
    """
    Record a tip on-chain via Hedera Consensus Service and persist to DB.

    The HBAR transaction must already be confirmed on-chain before calling
    this endpoint. HCS publishing is best-effort — if it fails, the tip is
    still recorded and success is returned (the HBAR already moved).
    """
    if not _TRANSACTION_ID_RE.match(request.transaction_id):
        raise HTTPException(
            status_code=422,
            detail="transaction_id must be in format 0.0.<number>@<seconds>.<nanos>",
        )

    network = settings.hedera_network
    hashscan_url = f"https://hashscan.io/{network}/transaction/{request.transaction_id}"
    hcs_url = f"https://hashscan.io/{network}/topic/{settings.hcs_topic_id}"

    # HCS publish is best-effort — the HBAR is already on-chain regardless
    hcs_message_id = "pending"
    try:
        receipt = await hcs_client.publish_tip_receipt(
            fact_id=request.fact_id,
            topic=request.topic,
            amount_hbar=request.amount,
            transaction_id=request.transaction_id,
        )
        hcs_message_id = str(receipt.sequence_number)
    except HCSError as exc:
        logger.error(
            "HCS publish failed (tip still on-chain): fact_id=%s tx=%s err=%s",
            request.fact_id,
            request.transaction_id,
            exc,
        )

    # If the fact doesn't exist in DB yet (e.g. from a previous session),
    # create a minimal stub so the foreign key constraint holds.
    fact_exists = await db.get(FactRecord, request.fact_id)
    if not fact_exists:
        stub = FactRecord(
            id=request.fact_id,
            query_id=None,
            title=f"Fact {request.fact_id[:8]}",
            summary="",
            confidence=0.0,
            sources="[]",
            category=request.topic,
        )
        await db.merge(stub)

    db.add(TipRecord(
        id=str(uuid.uuid4()),
        user_id=user_id,
        fact_id=request.fact_id,
        topic=request.topic,
        amount_hbar=request.amount,
        transaction_id=request.transaction_id,
        hashscan_url=hashscan_url,
        hcs_message_id=hcs_message_id,
        hcs_url=hcs_url,
    ))

    return TipResponse(
        transaction_id=request.transaction_id,
        hashscan_url=hashscan_url,
        hcs_message_id=hcs_message_id,
        hcs_url=hcs_url,
    )
