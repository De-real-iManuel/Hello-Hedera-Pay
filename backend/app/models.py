import re
from pydantic import BaseModel, Field, field_validator


class AnalyzeRequest(BaseModel):
    topic: str = Field(..., min_length=8, max_length=500)


class TipRequest(BaseModel):
    fact_id: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0, le=10000)
    transaction_id: str
    topic: str = Field(..., min_length=1, max_length=500)

    @field_validator("transaction_id")
    @classmethod
    def validate_transaction_id(cls, v: str) -> str:
        if not re.match(r"^0\.0\.\d+[@\-]\d+[.\-]\d+$", v):
            raise ValueError("transaction_id must be in format 0.0.<number>@<seconds>.<nanos>")
        return v


class Fact(BaseModel):
    id: str
    title: str = Field(..., max_length=200)
    summary: str = Field(..., max_length=1000)
    confidence: float = Field(..., ge=0.0, le=1.0)
    sources: list[str] = []
    agent_run_id: str | None = None
    hcs_topic_id: str | None = None


class AnalyzeResponse(BaseModel):
    facts: list[Fact]


class TipResponse(BaseModel):
    transaction_id: str
    hashscan_url: str
    hcs_message_id: str
    hcs_url: str


class ErrorResponse(BaseModel):
    message: str


class HealthResponse(BaseModel):
    status: str


class MilestoneCreate(BaseModel):
    contractor_id: str = Field(..., description="Payee's Hedera account ID")
    contractor_user_id: str | None = Field(None, description="Payee's Platform User ID (Optional)")
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(...)
    amount_hbar: float = Field(..., gt=0)
    invoice_ref: str = Field(..., min_length=3, max_length=100)


class MilestoneAgentChatRequest(BaseModel):
    milestone_id: str
    message: str
    action: str | None = None  # "approve" or "deny" or None

class AgentKitToolCall(BaseModel):
    name: str
    params: dict
    result: str | None = None

class MilestoneAgentChatResponse(BaseModel):
    response: str
    requires_approval: bool = False
    proposed_tool: AgentKitToolCall | None = None
    settled_details: dict | None = None

class MilestoneSettleRequest(BaseModel):
    milestone_id: str
    transaction_id: str | None = None # Now optional, populated by agent or frontend override


class MilestoneAcceptRequest(BaseModel):
    milestone_id: str


class MilestoneResponse(BaseModel):
    id: str
    creator_id: str | None = None
    contractor_id: str
    title: str
    description: str
    status: str
    amount_hbar: float
    invoice_ref: str
    payment_transaction_id: str | None = None
    reward_token_mint_tx_id: str | None = None
    certificate_nft_id: str | None = None
    hcs_audit_sequence: str | None = None
    contractor_user_id: str | None = None
    contractor_accepted: bool = False
    created_at: str

