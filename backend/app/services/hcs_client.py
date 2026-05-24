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
    client = Client.forMainnet() if settings.hedera_network == "mainnet" else Client.forTestnet()
    client.setOperator(AccountId.fromString(settings.hedera_account_id), PrivateKey.fromString(settings.hedera_private_key))
    return client


def _submit_message(message_bytes: bytes):
    try:
        from hedera import TopicId, TopicMessageSubmitTransaction
        client = _build_client()
        return (
            TopicMessageSubmitTransaction()
            .setTopicId(TopicId.fromString(settings.hcs_topic_id))
            .setMessage(message_bytes)
            .execute(client)
            .getReceipt(client)
        )
    except Exception as exc:
        raise HCSError(f"Hedera SDK error: {exc}") from exc


async def publish_to_hcs(tip_record):
    """Publish a tip to HCS and return (message_id, hcs_url)."""
    now = datetime.now(timezone.utc)
    timestamp = now.strftime("%Y-%m-%dT%H:%M:%S.") + f"{now.microsecond // 1000:03d}Z"
    payload = {
        "tip_id": tip_record.id,
        "fact_id": tip_record.fact_id,
        "topic": tip_record.topic,
        "amount_hbar": tip_record.amount_hbar,
        "transaction_id": tip_record.transaction_id,
        "timestamp": timestamp,
        "network": settings.hedera_network,
    }
    message_bytes = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    try:
        receipt = await asyncio.wait_for(asyncio.to_thread(_submit_message, message_bytes), timeout=30.0)
    except asyncio.TimeoutError as exc:
        raise HCSError(f"HCS submission timed out (tip_id={tip_record.id})") from exc
    except HCSError:
        raise
    except Exception as exc:
        raise HCSError(f"Unexpected error: {exc}") from exc
    
    logger.info("HCS message published: tip_id=%s sequence=%s", tip_record.id, receipt.topicSequenceNumber)
    message_id = str(receipt.topicSequenceNumber)
    hashscan_url = f"https://hashscan.io/{settings.hedera_network}/topic/{settings.hcs_topic_id}?message={message_id}"
    return message_id, hashscan_url


async def publish_tip_receipt(
    fact_id: str,
    topic: str,
    amount_hbar: float,
    transaction_id: str,
    fact_title: str = "",
    fact_summary: str = "",
    fact_agent_run_id: str | None = None,
    fact_hcs_topic_id: str | None = None,
):
    """Publish a tip receipt to HCS including the tipped fact's content."""
    now = datetime.now(timezone.utc)
    timestamp = now.strftime("%Y-%m-%dT%H:%M:%S.") + f"{now.microsecond // 1000:03d}Z"
    payload = {
        "type": "tip_receipt",
        "fact_id": fact_id,
        "fact_title": fact_title,
        "fact_summary": fact_summary[:500],  # cap to keep HCS message lean
        "topic": topic,
        "amount_hbar": amount_hbar,
        "transaction_id": transaction_id,
        "timestamp": timestamp,
        "network": settings.hedera_network,
        "fact_agent_run_id": fact_agent_run_id,
        "fact_hcs_topic_id": fact_hcs_topic_id,
    }
    message_bytes = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    try:
        receipt = await asyncio.wait_for(asyncio.to_thread(_submit_message, message_bytes), timeout=30.0)
    except asyncio.TimeoutError as exc:
        raise HCSError(f"HCS submission timed out (fact_id={fact_id})") from exc
    except HCSError:
        raise
    except Exception as exc:
        raise HCSError(f"Unexpected error: {exc}") from exc
    logger.info("HCS message published: fact_id=%s sequence=%s", fact_id, receipt.topicSequenceNumber)
    return receipt


async def verify_hedera_transaction(
    transaction_id: str,
    expected_recipient: str,
    expected_amount_hbar: float,
    network: str = "testnet",
) -> bool:
    """
    Queries the Hedera Mirror Node REST API to verify that a transaction:
    1. Exists and was successful.
    2. Transferred at least `expected_amount_hbar` to `expected_recipient`.
    """
    import httpx

    # Normalize Transaction ID from 0.0.X@seconds.nanos to 0.0.X-seconds-nanos
    normalized = transaction_id.strip()
    if "@" in normalized:
        account_id, timestamp = normalized.split("@", 1)
        timestamp = timestamp.replace(".", "-")
        normalized = f"{account_id}-{timestamp}"
    elif "-" in normalized:
        # already normalized or contains dashes
        pass
    else:
        logger.warning("Invalid Transaction ID format for verification: %s", transaction_id)
        return False

    base_url = "https://mainnet-public.mirrornode.hedera.com" if network == "mainnet" else "https://testnet.mirrornode.hedera.com"
    url = f"{base_url}/api/v1/transactions/{normalized}"

    # Retry up to 5 times with a 1.5-second delay to handle mirror node indexing lag
    for attempt in range(5):
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    transactions = data.get("transactions", [])
                    if transactions:
                        expected_tinybars = int(round(expected_amount_hbar * 100_000_000))
                        expected_recip = expected_recipient.strip()

                        for tx in transactions:
                            if tx.get("result") != "SUCCESS":
                                continue

                            transfers = tx.get("transfers", [])
                            matched_recipient = False
                            for transfer in transfers:
                                account = transfer.get("account")
                                amount = transfer.get("amount", 0)
                                if account and account.strip() == expected_recip:
                                    if amount >= expected_tinybars:
                                        matched_recipient = True
                                        break

                            if matched_recipient:
                                logger.info("Successfully verified transaction %s on mirror node (attempt %d).", transaction_id, attempt + 1)
                                return True

            logger.info("Transaction %s not found or not matched on attempt %d/5. Retrying...", transaction_id, attempt + 1)
        except Exception as exc:
            logger.warning("Error on verification attempt %d/5: %s", attempt + 1, exc)

        await asyncio.sleep(1.5)

    logger.warning("Transaction %s did not transfer %f HBAR to %s after 5 attempts", transaction_id, expected_amount_hbar, expected_recipient)
    return False


