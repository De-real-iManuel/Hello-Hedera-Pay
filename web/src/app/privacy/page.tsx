'use client';

import React from 'react';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import { Eye, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden text-foreground flex flex-col justify-between">
      <LandingNavbar />

      <section className="relative px-6 py-24 md:py-32 max-w-4xl mx-auto flex-1 w-full">
        {/* Glow effect background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-primary/5 blur-[90px] pointer-events-none -z-10" />

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest mb-6 w-max">
          <Eye size={12} />
          Privacy Standard
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8">
          Privacy <span className="gradient-text">Policy</span>
        </h1>

        <div className="glass-card p-8 md:p-10 rounded-2xl border border-border flex flex-col gap-6 leading-relaxed text-sm text-muted-foreground">
          <div className="flex items-start gap-4 pb-4 border-b border-border/40">
            <Shield size={24} className="text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-base font-bold text-foreground mb-1">Cryptographic Ledger Transparency</h3>
              <p>
                Hello-Hedera-Pay operates on Hedera Hashgraph, a public decentralized network. Tipping amounts, transaction IDs, HCS audit sequences, and contract interactions are committed to a public, immutable ledger. By initiating transactions, you acknowledge that blockchain addresses and metadata are permanently visible.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground mb-2">1. Information We Collect</h3>
            <p className="mb-3">
              We collect minimal private data to facilitate autonomous interactions:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Public Hedera account IDs (e.g., <code className="font-mono bg-muted/60 px-1 py-0.5 rounded text-foreground">0.0.123456</code>).</li>
              <li>Authentication metadata and access tokens.</li>
              <li>Escrow milestone metadata (agreed values, deliverables briefs, references).</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground mb-2">2. How Information is Used</h3>
            <p>
              Your public account identifiers and milestone parameters are used strictly to coordinate autonomous agent payouts, publish consensus-based research trail sequence numbers, and reward distribution verification.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground mb-2">3. Third-Party Integrations</h3>
            <p>
              We integrate with secure mirror node endpoints and LLMs (such as OpenRouter's Gemini). No private keys or wallet credentials are ever shared with third-party service providers.
            </p>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
