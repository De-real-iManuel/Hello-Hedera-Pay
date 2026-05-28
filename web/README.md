# Hello-Hedera-Pay Frontend

Next.js 15 frontend client for Hello-Hedera-Pay. It features a complete AI-driven intelligence dashboard with deep search fact-tipping capabilities and a voice-enabled procurement escrow management sidebar.

## Core Features

- **Voice-Activated AI Settlement:** Speak commands using browser-native Web Speech API, with active SpeechSynthesis response feedback.
- **Fact-Tipping Workspace:** Wallet integration using HashPack via `@hashgraph/hedera-wallet-connect` for micro-tipping HBAR.
- **Escrow State Machine Badge Panel:** UI tracking for PENDING, ACTIVE, DELIVERED, DISPUTED, and SETTLED states.
- **Safety Lockouts:** Disables cancellation buttons post-delivery and highlights mediation alerts.
- **Corporate Page Suite:** Includes About, Docs, Pricing, Privacy, and Terms of Service.

---

## Installation & Running

1. Install modules:
   ```bash
   npm install
   ```
2. Setup local environment configurations:
   ```bash
   cp .env.example .env.local
   # Define required Next.js variables
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```
4. Access app at `http://localhost:4028`.
