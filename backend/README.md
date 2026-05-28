# Hello-Hedera-Pay Backend

FastAPI backend for the Hello-Hedera-Pay Autonomous AI Treasury Agent & Tipping platform. Handles B2B Escrow milestone lifecycle status transitions, AI research workflows, tipping transactions, database interactions, and publishes immutable consensus logging receipts via the Hedera Consensus Service (HCS).

## Key Features

- **Multi-State Escrow Lifecycle:** State machine routes (`PENDING` -> `ACTIVE` -> `DELIVERED` -> `SETTLED` / `DISPUTED`).
- **Rug-Pull Protection:** Payee cancellation blocked after contractor marks work `DELIVERED`.
- **AI Research & Extraction:** Integration with Tavily Search and OpenRouter (Gemini) to extract and grade facts.
- **On-Chain HBAR Tipping:** Records tipping transactions and publishes receipts to HCS.
- **Autonomous AI Settlement Agent:** HITL voice/text conversation support.
- **Custom Hedera Agent Kit Plugins:** On-chain HBAR transfers + HCS topic logging.

---

## Installation & Setup

1. Create a Python virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Populate HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY, HCS_TOPIC_ID, etc.
   ```
4. Run server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```

---

## API Endpoints

### AI Tipping & Research
- `POST /analyze` - Run AI research topic extraction.
- `POST /tip` - Log tipping event and publish to HCS.
- `GET /history/queries` - User research query logs.
- `GET /history/tips` - Tipping receipt logs.

### B2B Escrow Milestones
- `POST /milestones` - Create new agreement.
- `POST /milestones/{id}/accept` - Contractor acceptance.
- `POST /milestones/{id}/deliver` - Contractor work submission (locks cancellation).
- `POST /milestones/{id}/cancel` - Payee cancellation (shifts to DISPUTED if already delivered).
- `POST /milestones/agent-chat` - Voice/text HITL agent mediation & settlement negotiation.
- `POST /milestones/settle` - Execute autonomous milestone settlement.
