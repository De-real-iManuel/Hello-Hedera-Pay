import logging
import uuid
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user_id, get_optional_user_id
from app.db.database import get_db
from app.db.models import MilestoneRecord
from app.models import MilestoneCreate, MilestoneResponse, MilestoneSettleRequest, MilestoneAcceptRequest, MilestoneAgentChatRequest, MilestoneAgentChatResponse
from app.config import settings
from app.services import hcs_client
from app.services.ai_agent import execute_milestone_agent_chat

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/milestones", tags=["milestones"])


@router.post("/agent-chat", response_model=MilestoneAgentChatResponse)
async def milestone_agent_chat(
    request: MilestoneAgentChatRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> MilestoneAgentChatResponse:
    """
    Step-by-step interactive conversational channel for milestone settlement.
    Integrates with browser audio and coordinates human-in-the-loop triggers.
    """
    record = await db.get(MilestoneRecord, request.milestone_id)
    if not record:
        raise HTTPException(status_code=404, detail="Milestone agreement not found.")

    if record.status == "SETTLED":
        raise HTTPException(status_code=400, detail="Milestone has already been settled.")

    # Execute interactive agent pipeline
    result = await execute_milestone_agent_chat(
        milestone_id=record.id,
        contractor_id=record.contractor_id,
        amount_hbar=record.amount_hbar,
        invoice_ref=record.invoice_ref,
        title=record.title,
        description=record.description,
        message=request.message,
        action=request.action
    )

    # If the transaction settled successfully in this chat step, record details immediately
    settled_data = result.get("settled_details")
    if settled_data:
        record.status = "SETTLED"
        record.payment_transaction_id = settled_data.get("transaction_id")
        record.hcs_audit_sequence = settled_data.get("hcs_sequence_number")
        record.reward_token_mint_tx_id = settled_data.get("reward_token_mint_tx_id")
        record.certificate_nft_id = settled_data.get("certificate_nft_id")
        await db.commit()
        await db.refresh(record)

    return MilestoneAgentChatResponse(
        response=result["response"],
        requires_approval=result["requires_approval"],
        proposed_tool=result["proposed_tool"],
        settled_details=result["settled_details"]
    )


@router.post("/settle", response_model=MilestoneResponse)
async def settle_milestone(
    request: MilestoneSettleRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> MilestoneResponse:
    """
    Direct settlement entrypoint (falls back to a default autonomous agent execution sequence).
    """
    record = await db.get(MilestoneRecord, request.milestone_id)
    if not record:
        raise HTTPException(status_code=404, detail="Milestone agreement not found.")

    if record.status == "SETTLED":
        raise HTTPException(status_code=400, detail="Milestone has already been settled.")

    # Call agent chat with auto-approval sequence to settle autonomously
    result = await execute_milestone_agent_chat(
        milestone_id=record.id,
        contractor_id=record.contractor_id,
        amount_hbar=record.amount_hbar,
        invoice_ref=record.invoice_ref,
        title=record.title,
        description=record.description,
        message="Please autonomously approve and execute this milestone procurement contract release.",
        action="approve"
    )

    settled_data = result.get("settled_details")
    if not settled_data:
        raise HTTPException(
            status_code=400,
            detail=f"Settlement failed during execution: {result['response']}"
        )

    # Record settled details
    record.status = "SETTLED"
    record.payment_transaction_id = settled_data.get("transaction_id")
    record.hcs_audit_sequence = settled_data.get("hcs_sequence_number")
    record.reward_token_mint_tx_id = settled_data.get("reward_token_mint_tx_id")
    record.certificate_nft_id = settled_data.get("certificate_nft_id")

    await db.commit()
    await db.refresh(record)

    return MilestoneResponse(
        id=record.id,
        creator_id=record.user_id,
        contractor_id=record.contractor_id,
        title=record.title,
        description=record.description,
        status=record.status,
        amount_hbar=record.amount_hbar,
        invoice_ref=record.invoice_ref,
        payment_transaction_id=record.payment_transaction_id,
        reward_token_mint_tx_id=record.reward_token_mint_tx_id,
        certificate_nft_id=record.certificate_nft_id,
        hcs_audit_sequence=record.hcs_audit_sequence,
        contractor_user_id=record.contractor_user_id,
        contractor_accepted=record.contractor_accepted,
        created_at=record.created_at.isoformat(),
    )


@router.post("", response_model=MilestoneResponse)
async def create_milestone(
    request: MilestoneCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> MilestoneResponse:
    """
    Create a new B2B Milestone Escrow procurement agreement.
    """
    # Check if invoice reference is unique
    existing = await db.execute(
        select(MilestoneRecord).where(MilestoneRecord.invoice_ref == request.invoice_ref)
    )
    if existing.scalars().first():
        raise HTTPException(
            status_code=400,
            detail=f"An invoice with reference '{request.invoice_ref}' already exists."
        )

    record = MilestoneRecord(
        id=str(uuid.uuid4()),
        user_id=user_id,
        contractor_id=request.contractor_id,
        title=request.title,
        description=request.description,
        status="PENDING",
        amount_hbar=request.amount_hbar,
        invoice_ref=request.invoice_ref,
        contractor_user_id=request.contractor_user_id,
    )

    db.add(record)
    await db.commit()
    await db.refresh(record)

    return MilestoneResponse(
        id=record.id,
        creator_id=record.user_id,
        contractor_id=record.contractor_id,
        title=record.title,
        description=record.description,
        status=record.status,
        amount_hbar=record.amount_hbar,
        invoice_ref=record.invoice_ref,
        contractor_user_id=record.contractor_user_id,
        contractor_accepted=record.contractor_accepted,
        created_at=record.created_at.isoformat(),
    )


@router.get("", response_model=List[MilestoneResponse])
async def list_milestones(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> List[MilestoneResponse]:
    """
    Retrieve all Milestone agreements for the authenticated corporate user.
    """
    result = await db.execute(
        select(MilestoneRecord)
        .where(
            (MilestoneRecord.user_id == user_id) | 
            (MilestoneRecord.contractor_user_id == user_id) | 
            (MilestoneRecord.contractor_id == user_id)
        )
        .order_by(MilestoneRecord.created_at.desc())
    )
    records = result.scalars().all()

    return [
        MilestoneResponse(
            id=r.id,
            creator_id=r.user_id,
            contractor_id=r.contractor_id,
            title=r.title,
            description=r.description,
            status=r.status,
            amount_hbar=r.amount_hbar,
            invoice_ref=r.invoice_ref,
            payment_transaction_id=r.payment_transaction_id,
            reward_token_mint_tx_id=r.reward_token_mint_tx_id,
            certificate_nft_id=r.certificate_nft_id,
            hcs_audit_sequence=r.hcs_audit_sequence,
            contractor_user_id=r.contractor_user_id,
            contractor_accepted=r.contractor_accepted,
            created_at=r.created_at.isoformat(),
        )
        for r in records
    ]





@router.get("/{milestone_id}", response_model=MilestoneResponse)
async def get_milestone(
    milestone_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str | None = Depends(get_optional_user_id),
) -> MilestoneResponse:
    """Fetch a single milestone by ID (powers shareable links)."""
    record = await db.get(MilestoneRecord, milestone_id)
    if not record:
        raise HTTPException(status_code=404, detail="Milestone not found.")

    return MilestoneResponse(
        id=record.id,
        creator_id=record.user_id,
        contractor_id=record.contractor_id,
        title=record.title,
        description=record.description,
        status=record.status,
        amount_hbar=record.amount_hbar,
        invoice_ref=record.invoice_ref,
        payment_transaction_id=record.payment_transaction_id,
        reward_token_mint_tx_id=record.reward_token_mint_tx_id,
        certificate_nft_id=record.certificate_nft_id,
        hcs_audit_sequence=record.hcs_audit_sequence,
        contractor_user_id=record.contractor_user_id,
        contractor_accepted=record.contractor_accepted,
        created_at=record.created_at.isoformat(),
    )


@router.post("/{milestone_id}/accept", response_model=MilestoneResponse)
async def accept_milestone(
    milestone_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> MilestoneResponse:
    """Contractor accepts/acknowledges a milestone assignment."""
    record = await db.get(MilestoneRecord, milestone_id)
    if not record:
        raise HTTPException(status_code=404, detail="Milestone not found.")

    if record.contractor_accepted:
        raise HTTPException(status_code=400, detail="Milestone already accepted.")

    record.contractor_user_id = user_id
    record.contractor_accepted = True
    record.status = "ACTIVE"

    await db.commit()
    await db.refresh(record)

    return MilestoneResponse(
        id=record.id,
        creator_id=record.user_id,
        contractor_id=record.contractor_id,
        title=record.title,
        description=record.description,
        status=record.status,
        amount_hbar=record.amount_hbar,
        invoice_ref=record.invoice_ref,
        payment_transaction_id=record.payment_transaction_id,
        reward_token_mint_tx_id=record.reward_token_mint_tx_id,
        certificate_nft_id=record.certificate_nft_id,
        hcs_audit_sequence=record.hcs_audit_sequence,
        contractor_user_id=record.contractor_user_id,
        contractor_accepted=record.contractor_accepted,
        created_at=record.created_at.isoformat(),
    )


@router.post("/{milestone_id}/deliver", response_model=MilestoneResponse)
async def deliver_milestone(
    milestone_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> MilestoneResponse:
    """Contractor marks the milestone work as completed/delivered."""
    record = await db.get(MilestoneRecord, milestone_id)
    if not record:
        raise HTTPException(status_code=404, detail="Milestone not found.")

    if record.status != "ACTIVE":
        raise HTTPException(status_code=400, detail="Milestone is not active.")

    if record.contractor_user_id != user_id and record.contractor_id != user_id:
         raise HTTPException(status_code=403, detail="Only the assigned contractor can mark as delivered.")

    record.status = "DELIVERED"

    await db.commit()
    await db.refresh(record)
    return MilestoneResponse(
        id=record.id,
        creator_id=record.user_id,
        contractor_id=record.contractor_id,
        title=record.title,
        description=record.description,
        status=record.status,
        amount_hbar=record.amount_hbar,
        invoice_ref=record.invoice_ref,
        payment_transaction_id=record.payment_transaction_id,
        reward_token_mint_tx_id=record.reward_token_mint_tx_id,
        certificate_nft_id=record.certificate_nft_id,
        hcs_audit_sequence=record.hcs_audit_sequence,
        contractor_user_id=record.contractor_user_id,
        contractor_accepted=record.contractor_accepted,
        created_at=record.created_at.isoformat(),
    )


@router.post("/{milestone_id}/cancel", response_model=MilestoneResponse)
async def cancel_milestone(
    milestone_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> MilestoneResponse:
    """
    Payee/Creator attempts to cancel the milestone.
    - If status is PENDING or ACTIVE, it can be cancelled.
    - If status is DELIVERED (work submitted), unilateral cancellation is blocked and it enters DISPUTED lock status.
    """
    record = await db.get(MilestoneRecord, milestone_id)
    if not record:
        raise HTTPException(status_code=404, detail="Milestone not found.")

    if record.user_id != user_id:
        raise HTTPException(status_code=403, detail="Only the creator/payee can cancel this milestone.")

    if record.status == "SETTLED":
        raise HTTPException(status_code=400, detail="Cannot cancel a settled milestone.")

    if record.status == "DELIVERED":
        # Unilateral cancellation blocked! Escrow locks into DISPUTED state.
        record.status = "DISPUTED"
        logger.warning("Payee attempted post-delivery cancellation. Escrow %s locked in DISPUTED state.", milestone_id)
    else:
        record.status = "CANCELLED"

    await db.commit()
    await db.refresh(record)
    return MilestoneResponse(
        id=record.id,
        creator_id=record.user_id,
        contractor_id=record.contractor_id,
        title=record.title,
        description=record.description,
        status=record.status,
        amount_hbar=record.amount_hbar,
        invoice_ref=record.invoice_ref,
        payment_transaction_id=record.payment_transaction_id,
        reward_token_mint_tx_id=record.reward_token_mint_tx_id,
        certificate_nft_id=record.certificate_nft_id,
        hcs_audit_sequence=record.hcs_audit_sequence,
        contractor_user_id=record.contractor_user_id,
        contractor_accepted=record.contractor_accepted,
        created_at=record.created_at.isoformat(),
    )
