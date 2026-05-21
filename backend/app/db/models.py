import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _uuid() -> str:
    return str(uuid.uuid4())


class QueryRecord(Base):
    __tablename__ = "queries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    topic: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    fact_count: Mapped[int] = mapped_column(Integer, default=0)

    facts: Mapped[List["FactRecord"]] = relationship("FactRecord", back_populates="query", cascade="all, delete-orphan")


class FactRecord(Base):
    __tablename__ = "facts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    query_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("queries.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    sources: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(200), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    query: Mapped[Optional["QueryRecord"]] = relationship("QueryRecord", back_populates="facts")
    tips: Mapped[List["TipRecord"]] = relationship("TipRecord", back_populates="fact", cascade="all, delete-orphan")


class TipRecord(Base):
    __tablename__ = "tips"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    fact_id: Mapped[str] = mapped_column(String(36), ForeignKey("facts.id", ondelete="CASCADE"), nullable=False)
    topic: Mapped[str] = mapped_column(Text, nullable=False)
    amount_hbar: Mapped[float] = mapped_column(Float, nullable=False)
    transaction_id: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    hashscan_url: Mapped[str] = mapped_column(Text, default="")
    hcs_message_id: Mapped[str] = mapped_column(String(100), default="pending")
    hcs_url: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    fact: Mapped["FactRecord"] = relationship("FactRecord", back_populates="tips")
