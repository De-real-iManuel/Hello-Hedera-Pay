# Hello-Hedera-Pay

🔍 **AI-powered fact discovery with HBAR tipping via Hedera HCS**

A fun, real-world application demonstrating the [Hedera Agent Kit](https://github.com/hashgraph/hedera-agent-kit) by enabling users to discover hidden facts about topics using AI, then tip content creators directly using HBAR transactions.

## Features

- 🤖 **AI-Powered Fact Discovery**: Uses advanced LLMs to extract non-obvious facts from web sources
- 🔎 **Web Search Integration**: Tavily API for comprehensive web research
- 💰 **HBAR Tipping**: Direct HBAR transfers to reward fact creators
- 📢 **HCS Publishing**: Transparent tip ledger on Hedera Consensus Service
- 📊 **Query History**: Track facts discovered and tips given
- 🚀 **Full-Stack**: Next.js frontend + FastAPI backend

## Architecture

```
Hello-Hedera-Pay/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── config.py          # Environment configuration
│   │   ├── models.py          # Pydantic request/response models
│   │   ├── auth.py            # Supabase JWT authentication
│   │   ├── routers/           # API route handlers
│   │   │   ├── analyze.py     # Topic analysis endpoint
│   │   │   ├── tip.py         # HBAR tipping endpoint
│   │   │   └── history.py     # Query/tip history endpoints
│   │   ├── services/          # Business logic
│   │   │   ├── ai_agent.py    # AI orchestration
│   │   │   ├── llm_client.py  # LLM integration (OpenRouter)
│   │   │   ├── tavily_client.py # Web search
│   │   │   └── hcs_client.py  # Hedera Consensus Service
│   │   ├── db/                # Database layer
│   │   │   ├── database.py    # SQLAlchemy setup
│   │   │   └── models.py      # ORM models
│   │   └── utils/
│   │       └── errors.py      # Error definitions
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example           # Environment template
│   ├── Dockerfile             # Docker build config
│   └── railway.toml           # Railway deployment config
│
├── web/                        # Next.js frontend
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── package.json           # Node dependencies
│   ├── tsconfig.json          # TypeScript config
│   ├── next.config.js         # Next.js config
│   └── .env.example           # Frontend env template
│
├── LICENSE                     # MIT License
├── README.md                   # This file
└── .gitignore                  # Git ignore rules
```

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Hedera testnet account with HBAR
- API keys: OpenRouter, Tavily, Supabase

### Backend Setup

1. **Clone and setup**:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and Hedera credentials
   ```

3. **Run migrations** (optional, SQLite auto-creates schema):
   ```bash
   python -c "from app.db.database import Base, engine; import asyncio; asyncio.run(Base.metadata.create_all(engine))"
   ```

4. **Start server**:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd web
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Edit with your API URL and Supabase keys
   ```

3. **Start dev server**:
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:4028`

## API Endpoints

### Analyze Endpoint
```http
POST /api/analyze/analyze
Content-Type: application/json

{
  "topic": "Climate change impacts on agriculture"
}

Response:
{
  "facts": [
    {
      "id": "uuid",
      "title": "Fact Title",
      "summary": "Detailed summary...",
      "confidence": 0.85,
      "sources": ["url1", "url2"]
    }
  ]
}
```

### Tip Endpoint
```http
POST /api/tips/tip
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "fact_id": "fact-uuid",
  "amount": 10.5,
  "transaction_id": "0.0.123@1234.5678",
  "topic": "Climate change impacts on agriculture"
}

Response:
{
  "transaction_id": "0.0.123@1234.5678",
  "hashscan_url": "https://hashscan.io/testnet/transaction/...",
  "hcs_message_id": "12345",
  "hcs_url": "https://hashscan.io/testnet/topic/..."
}
```

### History Endpoints
```http
GET /api/history/queries?skip=0&limit=10
GET /api/history/tips?skip=0&limit=10
GET /api/history/tips/total
```

## Environment Configuration

### Backend (.env)
- `OPENROUTER_API_KEY`: OpenRouter API key (for LLM)
- `TAVILY_API_KEY`: Tavily API key (for web search)
- `HEDERA_ACCOUNT_ID`: Your Hedera account (0.0.xxx format)
- `HEDERA_PRIVATE_KEY`: Hedera private key (hex)
- `HEDERA_NETWORK`: testnet or mainnet
- `HCS_TOPIC_ID`: Hedera Consensus Service topic (0.0.xxx)
- `SUPABASE_*`: Supabase credentials
- `PORT`: Server port (default 8000)
- `ALLOWED_ORIGINS`: CORS allowed origins

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key

## Deployment

### Backend on Railway

1. Connect your GitHub repo to Railway
2. Set environment variables in Railway dashboard
3. Railway will auto-detect and deploy with `Dockerfile`

### Frontend on Vercel

1. Connect your GitHub repo to Vercel
2. Configure environment variables
3. Deploy with `npm run build && npm start`

## Development

### Running Tests
```bash
cd backend
pytest tests/
```

### Linting & Formatting
```bash
# Backend
cd backend
python -m black app/
python -m isort app/

# Frontend
cd web
npm run lint
```

## Key Technologies

- **Backend**: FastAPI, SQLAlchemy, Hedera SDK
- **Frontend**: Next.js, React, TypeScript
- **AI**: OpenRouter (LLM), Tavily (web search)
- **Blockchain**: Hedera Hashgraph (HBAR transfers, HCS)
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Auth**: Supabase JWT

## Project Scope

Built for **Hedera Agent Kit - Week 1 Challenge** (Bounty):
- ✅ Uses Hedera Agent Kit for on-chain actions
- ✅ Real HBAR transfers for tipping
- ✅ Simple, fun use case
- ✅ Clean git history with atomic commits
- ✅ Public repository ready for judging

## Contributing

1. Create feature branches from `main`
2. Make small, atomic commits with descriptive messages
3. Ensure no secrets are committed (use `.env` files)
4. Test before pushing
5. Open pull requests for review

## License

MIT License - see [LICENSE](LICENSE) for details

## Support

For issues or questions:
1. Check the [Hedera documentation](https://docs.hedera.com)
2. Review [Hedera Agent Kit](https://github.com/hashgraph/hedera-agent-kit)
3. Check FastAPI and Next.js documentation
4. Open an issue on this repository

## Acknowledgments

- Built with [Hedera Agent Kit](https://github.com/hashgraph/hedera-agent-kit)
- AI facts powered by [OpenRouter](https://openrouter.ai)
- Web search via [Tavily API](https://tavily.com)
- Auth & DB via [Supabase](https://supabase.com)
- Deployed on [Railway](https://railway.app) & [Vercel](https://vercel.com)

---

**Created for Hedera Bounty Season - Week 1**
