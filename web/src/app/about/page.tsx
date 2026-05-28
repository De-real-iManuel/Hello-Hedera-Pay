'use client';

import React from 'react';
import Link from 'next/link';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import { Compass, Users, Milestone, ShieldCheck, Cpu } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden text-foreground flex flex-col justify-between">
      <LandingNavbar />

      <section className="relative px-6 py-24 md:py-32 max-w-5xl mx-auto flex-1 flex flex-col justify-center">
        {/* Glow effect background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px] pointer-events-none -z-10" />

        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest mb-4">
            <Compass size={12} />
            Our Mission
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Pioneering Decentralized <span className="gradient-text">Trust & Escrow</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Hello-Hedera-Pay was conceived to bridge the gap between autonomous AI capabilities and real-world commercial trust. By leveraging the speed and security of Hedera Hashgraph, we have built the ultimate settlement system for modern B2B agreements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="glass-card p-8 rounded-2xl border border-border hover:border-primary/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center mb-6">
              <Cpu size={24} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Autonomous AI Operations</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We empower autonomous agents running on the Hedera Agent Kit to negotiate, verify deliverables, and directly trigger on-chain payments without intermediate friction, keeping operational overhead near zero.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-border hover:border-primary/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-success/15 border border-success/20 flex items-center justify-center mb-6">
              <ShieldCheck size={24} className="text-success" />
            </div>
            <h3 className="text-xl font-bold mb-3">Unconditional Trust Vaults</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every procurement contract requires a locked deposit in our secure Treasury Vault. Our multi-state state machine protects contractors from payee rug-pulls by locking funds automatically in case of dispute.
            </p>
          </div>
        </div>

        <div className="glass-card p-10 rounded-3xl border border-border/80 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-success/5 pointer-events-none" />
          <h2 className="text-2xl font-bold mb-4 relative z-10">Ready to automate your B2B agreements?</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto mb-6 relative z-10">
            Experience lightning-fast Hedera consensus, immutable HCS audit logging, and intelligent agent mediation today.
          </p>
          <div className="relative z-10 flex flex-wrap gap-4 justify-center">
            <Link
              href="/intelligence-dashboard"
              className="px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl shadow-lg transition duration-200"
            >
              Launch Dashboard
            </Link>
            <Link
              href="/"
              className="px-6 py-3 text-sm font-semibold bg-muted/60 text-foreground border border-border hover:bg-muted rounded-xl transition duration-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
