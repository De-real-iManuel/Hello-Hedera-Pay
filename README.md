# Hello-Hedera-Pay

AI-powered fact discovery with HBAR tipping via Hedera Consensus Service.

Users submit a research topic, the platform surfaces hidden or underreported facts using AI, and anyone can tip a fact on-chain with HBAR. Every tip is recorded to the Hedera Consensus Service, creating a tamper-proof audit trail.

## Features

- AI-powered fact discovery using LLMs and web search
- Confidence scoring per fact based on source corroboration
- Direct HBAR tipping via WalletConnect (HashPack)
- HCS publication of tip receipts for on-chain transparency
- SQLite persistence for queries, facts, and tips
- Query history and tip history endpoints

## Architecture

```
Hello-Hedera-Pay/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py             # App entry point, startup, CORS
│   │   ├── config.py           # Pydantic settings from environment
│   │   ├── models.py           # Pydantic request/response models
│   │   ├── routers/
│   │   │   ├── analyze.py      # POST /analyze
│   │   │   ├── tip.py          # POST /tip
│   │   │   └── history.py      # GET /history/queries, /history/tips
│   │   ├── services/
│   │   │   ├── ai_agent.py     # Research pipeline orchestrator
│   │   │   ├── llm_client.py   # OpenRouter API client
│   │   │   ├── tavily_client.py # Tavily web search client
│   │   │   └── hcs_client.py   # Hedera Consensus Service client
│   │   ├── db/
│   │   │   ├── database.py     # SQLAlchemy async engine and session
│   │   │   └── models.py       # ORM models: QueryRecord, FactRecord, TipRecord
│   │   └── utils/
│   │       └── errors.py       # Error sanitization
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   └── railway.toml
│
├── web/                        # Next.js 15 frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx      # Root layout with fonts and Toaster
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── components/     # Landing page sections
│   │   │   └── intelligence-dashboard/
│   │   │       ├── layout.tsx  # Dashboard shell (sidebar + topbar)
│   │   │       ├── page.tsx    # Main query + results view
│   │   │       └── components/ # Dashboard UI components
│   │   ├── hooks/
│   │   │   └── useWalletConnect.ts  # WalletConnect + HBAR transfer hook
│   │   ├── lib/
│   │   │   └── mockData.ts     # Static sample data
│   │   ├── styles/
│   │   │   └── tailwind.css    # Global styles and design tokens
│   │   └── types/
│   │       └── intelligence.ts # Shared TypeScript types
│   ├── package.json
│   ├── next.config.js
│   └── .env.example
│
├── README.md
├── LICENSE
└── .gitignore
```

## Quick Start

### Prerequisites

- Python 3.11 or 3.12 (3.14 works with the included compatibility fixes)
- Node.js 18+
- A Hedera testnet account with HBAR ([portal.hedera.com](https://portal.hedera.com))
- API keys: OpenRouter, Tavily

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Fill in your API keys and Hedera credentials in .env

python -m uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd web
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000 in .env.local

npm run dev
```

Opens at `http://localhost:4028`.

## API Reference

### POST /analyze

Run the AI research pipeline on a topic.

```http
POST /analyze
Content-Type: application/json

{ "topic": "Hedera governance changes Q1 2026" }
```

Response:

```json
{
  "facts": [
    {
      "id": "uuid",
      "title": "Fact title",
      "summary": "Detailed summary...",
      "confidence": 0.87,
      "sources": ["https://example.com/source"]
    }
  ]
}
```

### POST /tip

Record a tip after a wallet transaction has been confirmed.

```http
POST /tip
Content-Type: application/json

{
  "fact_id": "uuid",
  "amount": 0.5,
  "transaction_id": "0.0.7942957@1747234512.009",
  "topic": "Hedera governance changes Q1 2026"
}
```

Response:

```json
{
  "transaction_id": "0.0.7942957@1747234512.009",
  "hashscan_url": "https://hashscan.io/testnet/transaction/...",
  "hcs_message_id": "42",
  "hcs_url": "https://hashscan.io/testnet/topic/0.0.8999600"
}
```

### GET /history/queries

Returns recent queries with their facts, newest first.

```http
GET /history/queries?limit=20
```

### GET /history/tips

Returns all recorded tips, newest first.

```http
GET /history/tips?limit=50
```

### GET /health

Health check for deployment probes.

```http
GET /health
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `OPENROUTER_MODEL` | Model identifier, e.g. `openai/gpt-4o-mini` |
| `TAVILY_API_KEY` | Tavily Search API key |
| `HEDERA_ACCOUNT_ID` | Operator account ID (`0.0.<number>`) |
| `HEDERA_PRIVATE_KEY` | Operator ED25519 private key (hex) |
| `HEDERA_NETWORK` | `testnet` or `mainnet` |
| `HCS_TOPIC_ID` | HCS topic for tip receipts (`0.0.<number>`) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `PORT` | Server port (default `8000`) |

### Frontend (`web/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL |
| `NEXT_PUBLIC_HEDERA_NETWORK` | `testnet` or `mainnet` |
| `NEXT_PUBLIC_TIP_RECIPIENT_ACCOUNT_ID` | Account that receives tips |
| `NEXT_PUBLIC_TIP_AMOUNT_HBAR` | Default tip amount in HBAR |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID |

## Deployment

### Backend on Railway

1. Connect the GitHub repo to Railway.
2. Set all environment variables in the Railway dashboard.
3. Railway auto-detects the `Dockerfile` and deploys.

### Frontend on Vercel

1. Connect the GitHub repo to Vercel.
2. Set `NEXT_PUBLIC_*` environment variables.
3. Set the root directory to `web`.
4. Deploy.

## Development

### Running backend tests

```bash
cd backend
pytest tests/ -v
```

### Linting

```bash
# Frontend
cd web && npm run lint

# Backend (if black/isort are installed)
cd backend && python -m black app/ && python -m isort app/
```

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy (async), aiosqlite, httpx
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, framer-motion
- **AI**: OpenRouter (LLM), Tavily (web search)
- **Blockchain**: Hedera Hashgraph — HBAR transfers, Hedera Consensus Service
- **Wallet**: WalletConnect via `@hashgraph/hedera-wallet-connect`
- **Database**: SQLite (development), compatible with PostgreSQL (production)

## License

MIT — see [LICENSE](LICENSE).
