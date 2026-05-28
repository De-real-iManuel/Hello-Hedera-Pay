'use client';

import React from 'react';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import { Scale, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden text-foreground flex flex-col justify-between">
      <LandingNavbar />

      <section className="relative px-6 py-24 md:py-32 max-w-4xl mx-auto flex-1 w-full">
        {/* Glow effect background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-success/5 blur-[90px] pointer-events-none -z-10" />

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest mb-6 w-max">
          <Scale size={12} />
          Legal Terms
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8">
          Terms of <span className="gradient-text">Service</span>
        </h1>

        <div className="glass-card p-8 md:p-10 rounded-2xl border border-border flex flex-col gap-6 leading-relaxed text-sm text-muted-foreground">
          <div className="flex items-start gap-4 pb-4 border-b border-border/40">
            <FileText size={24} className="text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-base font-bold text-foreground mb-1">Decentralized Agreement Framework</h3>
              <p>
                By creating or accepting a milestone on Hello-Hedera-Pay, you enter into a binding bilateral escrow agreement governed by Hedera Hashgraph ledger consensus rules.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground mb-2">1. Locked Vault Deposits</h3>
            <p>
              To activate an escrow agreement, the Payee must deposit the specified Hbar amount into the Treasury Vault. Funds are securely locked and cannot be withdrawn unilaterally by either party except as provided by the trust state machine (settlement, mutually agreed cancellation, or dispute mediation).
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground mb-2">2. Unilateral Cancellation Lock</h3>
            <p>
              Once a contractor has marked a milestone as **DELIVERED**, unilateral cancellation by the payee is locked and suspended. If the payee attempts cancellation in this state, the agreement is locked as **DISPUTED**. The funds will remain locked in the Treasury vault until a resolution is negotiated via the AI Mediation Agent or resolved by human arbitration.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground mb-2">3. Disclaimer of Blockchain Risk</h3>
            <p>
              Decentralized operations involve inherent network and smart contract vulnerabilities. Hello-Hedera-Pay is provided "as is". We are not responsible for Hedera network lag, gas spikes, private key mismanagement, or mirror node sync delays.
            </p>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
