# Hello-Hedera-Pay — Frontend

Next.js 15 frontend for the Hello-Hedera-Pay Truth Tip Agent. Provides the research dashboard, HashPack wallet integration, and HBAR tipping flow.

---

## Architecture

```
web/
├── src/
│   ├── app/
│   │   ├── layout.tsx                        # Root layout with AuthProvider
│   │   ├── page.tsx                          # Landing page
│   │   ├── login/
│   │   │   └── page.tsx                      # Sign in / sign up
│   │   └── intelligence-dashboard/
│   │       ├── layout.tsx                    # Dashboard shell with sidebar and topbar
│   │       ├── page.tsx                      # Main query and results view
│   │       ├── DashboardShellContext.tsx      # Shared wallet and query state
│   │       └── components/
│   │           ├── DashboardLayout.tsx        # Query panel + results panel
│   │           ├── DashboardSidebar.tsx       # Navigation and recent queries
│   │           ├── DashboardTopbar.tsx        # Wallet connect button
│   │           ├── QueryPanel.tsx             # Topic input
│   │           ├── ResultsPanel.tsx           # Facts grid
│   │           ├── IntelligenceCard.tsx       # Individual fact card with tip button
│   │           └── TipSuccessModal.tsx        # Post-tip confirmation modal
│   ├── contexts/
│   │   └── AuthContext.tsx                   # Supabase session and access token
│   ├── hooks/
│   │   └── useWalletConnect.ts               # HashPack wallet connection and HBAR transfer
│   ├── lib/
│   │   └── supabase.ts                       # Supabase browser client
│   └── types/
│       └── intelligence.ts                   # Shared TypeScript types
├── public/                                   # Static assets
├── .env.example                              # Environment variable template
├── next.config.mjs                           # Next.js configuration
├── tailwind.config.js                        # Tailwind CSS configuration
└── package.json                              # Dependencies and scripts
```

---

## Setup

### Requirements

- Node.js 18+
- A running instance of the [backend](../backend/README.md)
- [WalletConnect](https://cloud.walletconnect.com) project ID
- [Supabase](https://supabase.com) project

### Installation

```bash
npm install
cp .env.example .env.local
```

Fill in all values in `.env.local`, then start the development server:

```bash
npm run dev
```

App available at `http://localhost:4028`

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend base URL e.g. `http://localhost:8000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
| `NEXT_PUBLIC_HEDERA_NETWORK` | `testnet` or `mainnet` |
| `NEXT_PUBLIC_TIP_RECIPIENT_ACCOUNT_ID` | Hedera account that receives HBAR tips |
| `NEXT_PUBLIC_HCS_TOPIC_ID` | HCS topic ID for tip receipts |
| `NEXT_PUBLIC_TIP_AMOUNT_HBAR` | Default tip amount in HBAR |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID |

---

## Tip Flow

```
User clicks "Tip HBAR" on a fact card
        │
        ▼
HashPack wallet opens — user approves HBAR transfer
        │
        ▼
Transaction confirmed on Hedera testnet
        │
        ▼
Backend POST /tip called with transaction ID
        │
        ├── Publishes Tip_Receipt to HCS topic
        └── Persists tip to Supabase
                │
                ▼
        Success modal shows:
        ├── HashScan transaction link
        └── HashScan HCS record link
```

---

## Authentication Flow

1. User visits `/login` and signs in with email and password via Supabase Auth
2. Supabase issues a JWT stored in the browser session
3. `AuthContext` exposes the `accessToken` to all components
4. Every API call to the backend includes `Authorization: Bearer <token>`
5. `AuthGuard` wraps the dashboard and redirects unauthenticated users to `/login`

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on port 4028 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format with Prettier |
| `npm run type-check` | TypeScript type checking |

---

## Deployment

Deploy to Vercel:

1. Connect the GitHub repo to Vercel
2. Set root directory to `web`
3. Add all `NEXT_PUBLIC_*` environment variables
4. Deploy

---

## License

MIT
