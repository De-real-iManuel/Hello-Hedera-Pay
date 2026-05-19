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
