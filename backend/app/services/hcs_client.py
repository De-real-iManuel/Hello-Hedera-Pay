from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime, timezone

from app.config import settings

logger = logging.getLogger(__name__)


class HCSError(Exception):
    pass


def _build_client():
    from hedera import AccountId, Client, PrivateKey
    client = Client.for_mainnet() if settings.hedera_network == "mainnet" else Client.for_testnet()
    client.set_operator(AccountId.from_string(settings.hedera_account_id), PrivateKey.from_string(settings.hedera_private_key))
    return client


def _submit_message(message_bytes: bytes):
    try:
        from hedera import TopicId, TopicMessageSubmitTransaction
        client = _build_client()
        return (
            TopicMessageSubmitTransaction()
            .set_topic_id(TopicId.from_string(settings.hcs_topic_id))
            .set_message(message_bytes)
            .execute(client)
        )
    except Exception as exc:
        raise HCSError(f"Hedera SDK error: {exc}") from exc


async def publish_tip_receipt(fact_id: str, topic: str, amount_hbar: float, transaction_id: str):
    now = datetime.now(timezone.utc)
    timestamp = now.strftime("%Y-%m-%dT%H:%M:%S.") + f"{now.microsecond // 1000:03d}Z"
    payload = {"fact_id": fact_id, "topic": topic, "amount_hbar": amount_hbar, "transaction_id": transaction_id, "timestamp": timestamp, "network": settings.hedera_network}
    message_bytes = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    try:
        receipt = await asyncio.wait_for(asyncio.to_thread(_submit_message, message_bytes), timeout=30.0)
    except asyncio.TimeoutError as exc:
        raise HCSError(f"HCS submission timed out (fact_id={fact_id})") from exc
    except HCSError:
        raise
    except Exception as exc:
        raise HCSError(f"Unexpected error: {exc}") from exc
    logger.info("HCS message published: fact_id=%s sequence=%s", fact_id, receipt.sequence_number)
    return receipt
