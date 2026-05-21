# Hello-Hedera-Pay — Backend

FastAPI backend for the Hello-Hedera-Pay Truth Tip Agent. Handles AI research, Hedera Consensus Service publishing, and per-user data persistence.

---

## Architecture

```
backend/
├── app/
│   ├── main.py             # FastAPI app entry point, CORS, startup
│   ├── config.py           # Pydantic settings loaded from environment
│   ├── auth.py             # Supabase JWT verification dependency
│   ├── models.py           # Pydantic request/response schemas
│   ├── db/
│   │   ├── database.py     # Async SQLAlchemy engine and session
│   │   └── models.py       # ORM models: QueryRecord, FactRecord, TipRecord
│   ├── routers/
│   │   ├── analyze.py      # POST /analyze
│   │   ├── tip.py          # POST /tip
│   │   └── history.py      # GET /history/queries, /history/tips
│   ├── services/
│   │   ├── ai_agent.py     # Research pipeline orchestrator
│   │   ├── llm_client.py   # OpenRouter API client
│   │   ├── tavily_client.py# Tavily web search client
│   │   └── hcs_client.py   # Hedera Consensus Service client
│   └── utils/
│       └── errors.py       # Error sanitization
├── tests/                  # Pytest test suite
├── .env.example            # Environment variable template
├── Dockerfile              # Container definition
├── railway.toml            # Railway deployment config
└── requirements.txt        # Python dependencies
```

---

## Setup

### Requirements

- Python 3.11+
- A Hedera testnet account — [portal.hedera.com](https://portal.hedera.com)
- OpenRouter API key — [openrouter.ai](https://openrouter.ai)
- Tavily API key — [tavily.com](https://tavily.com)
- Supabase project — [supabase.com](https://supabase.com)

### Installation

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Fill in all values in `.env`, then start the server:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `OPENROUTER_MODEL` | Model identifier e.g. `google/gemini-2.5-flash-lite` |
| `TAVILY_API_KEY` | Tavily Search API key |
| `HEDERA_ACCOUNT_ID` | Operator account ID (`0.0.<number>`) |
| `HEDERA_PRIVATE_KEY` | Operator ED25519 private key |
| `HEDERA_NETWORK` | `testnet` or `mainnet` |
| `HCS_TOPIC_ID` | Pre-existing HCS topic ID (`0.0.<number>`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret for token verification |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowed origins |
| `PORT` | Server port (default `8000`) |

---

## API Endpoints

### `POST /analyze`

Runs the AI research pipeline on a topic.

**Request**
```json
{ "topic": "Hedera governance changes Q1 2026" }
```

**Response**
```json
{
  "facts": [
    {
      "id": "uuid",
      "title": "Fact title",
      "summary": "Detailed summary",
      "confidence": 0.87,
      "sources": ["https://example.com"]
    }
  ]
}
```

### `POST /tip`

Records a confirmed HBAR tip and publishes a receipt to HCS.

**Request**
```json
{
  "fact_id": "uuid",
  "amount": 0.5,
  "transaction_id": "0.0.12345@1747234512.009",
  "topic": "Hedera governance changes Q1 2026"
}
```

**Response**
```json
{
  "transaction_id": "0.0.12345@1747234512.009",
  "hashscan_url": "https://hashscan.io/testnet/transaction/...",
  "hcs_message_id": "42",
  "hcs_url": "https://hashscan.io/testnet/topic/0.0.8999600"
}
```

### `GET /history/queries?limit=20`

Returns the authenticated user's recent research sessions with facts.

### `GET /history/tips?limit=50`

Returns the authenticated user's tip history.

### `GET /health`

Returns `{ "status": "ok" }`. Used for deployment health probes.

---

## Authentication

All endpoints except `/health` require a valid Supabase JWT:

```
Authorization: Bearer <supabase-access-token>
```

The token is verified against `SUPABASE_JWT_SECRET`. The `sub` claim is used as the `user_id` to scope all database queries.

---

## HCS Tip Receipt Format

Every confirmed tip publishes the following JSON to the configured HCS topic:

```json
{
  "fact_id": "uuid",
  "topic": "research topic string",
  "amount_hbar": 0.5,
  "transaction_id": "0.0.12345@1747234512.009",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "network": "testnet"
}
```

---

## Running Tests

```bash
pytest tests/ -v
```

---

## Deployment

The backend is configured for Railway deployment:

1. Connect the GitHub repo to Railway
2. Set all environment variables in the Railway dashboard
3. Railway auto-detects the `Dockerfile` and deploys

---

## License

MIT
