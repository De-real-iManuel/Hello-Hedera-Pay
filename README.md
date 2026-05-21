# Hello-Hedera-Pay

**AI-powered research agent with on-chain HBAR tipping via Hedera Consensus Service.**

Hello-Hedera-Pay lets users research any topic using AI, surface hidden facts with confidence scoring, and tip verified intelligence on-chain using real HBAR. Every tip is published as an immutable receipt to the Hedera Consensus Service, creating a tamper-proof audit trail of what was tipped and why.

---

## Repository Structure

```
Hello-Hedera-Pay/
├── backend/        # FastAPI backend — AI research pipeline, HCS publishing, REST API
├── web/            # Next.js 15 frontend — dashboard, wallet connect, tip flow
├── .gitignore
├── LICENSE
└── README.md
```

---

## How It Works

1. **Research** — User submits a topic. The backend queries Tavily for live web sources, passes them to an LLM via OpenRouter, and extracts 3–5 hidden facts with confidence scores.
2. **Tip** — User connects their HashPack wallet and tips a fact with HBAR. The wallet signs and broadcasts the transfer on Hedera testnet.
3. **Publish** — The backend publishes a structured `Tip_Receipt` JSON message to a Hedera Consensus Service topic, creating a verifiable on-chain record.
4. **Verify** — The user receives HashScan links for both the HBAR transfer and the HCS message.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.11+, SQLAlchemy (async) |
| AI | Tavily Search API, OpenRouter (Gemini 2.5 Flash Lite) |
| Blockchain | Hedera SDK for Python — HCS message publishing |
| Wallet | HashPack via `@hashgraph/hedera-wallet-connect` |
| Auth & Database | Supabase (Auth + Postgres) |

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- [Hedera testnet account](https://portal.hedera.com)
- [Supabase](https://supabase.com) project
- [OpenRouter](https://openrouter.ai) API key
- [Tavily](https://tavily.com) API key
- [WalletConnect](https://cloud.walletconnect.com) project ID

### 1. Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Fill in your credentials

python -m uvicorn app.main:app --reload --port 8000
```

API available at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`

### 2. Frontend

```bash
cd web
npm install
cp .env.example .env.local
# Fill in your credentials

npm run dev
```

App available at `http://localhost:4028`

### 3. Supabase Database

Run the following SQL in your Supabase SQL Editor to create the required tables:

```sql
create table queries (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  created_at timestamptz default now(),
  fact_count int default 0
);

create table facts (
  id text primary key,
  query_id text references queries(id) on delete set null,
  title varchar(200) not null,
  summary text not null,
  confidence float not null,
  sources text default '[]',
  category varchar(200) default '',
  created_at timestamptz default now()
);

create table tips (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  fact_id text references facts(id) on delete cascade,
  topic text not null,
  amount_hbar float not null,
  transaction_id varchar(200) not null unique,
  hashscan_url text default '',
  hcs_message_id varchar(100) default 'pending',
  hcs_url text default '',
  created_at timestamptz default now()
);

alter table queries enable row level security;
alter table tips enable row level security;

create policy "users see own queries" on queries
  for all using (auth.uid() = user_id);

create policy "users see own tips" on tips
  for all using (auth.uid() = user_id);
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/analyze` | Run AI research pipeline on a topic |
| `POST` | `/tip` | Record a confirmed HBAR tip and publish to HCS |
| `GET` | `/history/queries` | Fetch user's past research sessions |
| `GET` | `/history/tips` | Fetch user's tip history |
| `GET` | `/health` | Health check |

All endpoints except `/health` require a Supabase JWT in the `Authorization: Bearer <token>` header.

---

## Environment Variables

See [`backend/.env.example`](backend/.env.example) and [`web/.env.example`](web/.env.example) for the full list of required variables.

---

## Deployment

- **Backend** — Deploy to [Railway](https://railway.app) using the included `Dockerfile` and `railway.toml`
- **Frontend** — Deploy to [Vercel](https://vercel.com), set root directory to `web`

---

## License

MIT — see [LICENSE](LICENSE)
