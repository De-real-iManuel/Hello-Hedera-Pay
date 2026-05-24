#!/usr/bin/env python3
"""
Create a new HCS topic named "Hello-Hedera-Pay" on the configured Hedera network.

Run once, then update HCS_TOPIC_ID in your .env with the printed topic ID.

Usage:
    cd backend
    python -m scripts.create_hcs_topic
"""
from __future__ import annotations

import os
import sys

# Ensure the backend package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))


def main() -> None:
    from hedera import (
        AccountId,
        Client,
        PrivateKey,
        TopicCreateTransaction,
    )

    account_id = os.environ["HEDERA_ACCOUNT_ID"].strip()
    private_key = os.environ["HEDERA_PRIVATE_KEY"].strip()
    network = os.environ.get("HEDERA_NETWORK", "testnet").strip()

    print(f"Network  : {network}")
    print(f"Operator : {account_id}")

    client = (
        Client.forMainnet() if network == "mainnet" else Client.forTestnet()
    )
    client.setOperator(
        AccountId.fromString(account_id),
        PrivateKey.fromString(private_key),
    )

    tx = (
        TopicCreateTransaction()
        .setTopicMemo("Hello-Hedera-Pay")
    )

    receipt = tx.execute(client).getReceipt(client)
    topic_id = receipt.topicId

    print()
    print("=" * 56)
    print(f"  HCS Topic created: {topic_id}")
    print(f"  Memo             : Hello-Hedera-Pay")
    print(f"  HashScan         : https://hashscan.io/{network}/topic/{topic_id}")
    print("=" * 56)
    print()
    print(f"Update your .env:")
    print(f"  HCS_TOPIC_ID={topic_id}")


if __name__ == "__main__":
    main()
