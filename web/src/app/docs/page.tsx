'use client';

import React from 'react';
import Link from 'next/link';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import { BookOpen, Terminal, Code, Cpu, Award } from 'lucide-react';

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden text-foreground flex flex-col justify-between">
      <LandingNavbar />

      <section className="relative px-6 py-24 md:py-32 max-w-5xl mx-auto flex-1 w-full">
        {/* Glow effect background */}
        <div className="absolute top-10 left-10 w-[300px] h-[300px] rounded-full bg-success/5 blur-[100px] pointer-events-none -z-10" />

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest mb-6 w-max">
          <BookOpen size={12} />
          Developer Center
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8">
          Platform <span className="gradient-text">Documentation</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-1 flex flex-col gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">Getting Started</span>
            <a href="#overview" className="px-3 py-2 rounded-lg text-sm bg-primary/10 text-primary font-semibold transition-all">Overview</a>
            <a href="#agent-kit" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-all">Hedera Agent Kit</a>
            <a href="#state-machine" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-all">Trust State Machine</a>
            <a href="#hcs-audits" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-all">HCS Audit Receipts</a>
          </aside>

          {/* Docs Content */}
          <div className="lg:col-span-3 flex flex-col gap-12">
            
            {/* Overview */}
            <div id="overview" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Code size={20} className="text-primary" />
                1. System Overview
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Hello-Hedera-Pay is a B2B treasury coordination protocol that leverages autonomous AI agents to mediate and settle commercial procurement agreements. By using Hedera Hashgraph smart vaults and HCS audit trails, we deliver tamper-proof escrow contracts and instant settlement metrics.
              </p>
            </div>

            {/* Hedera Agent Kit */}
            <div id="agent-kit" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Cpu size={20} className="text-primary" />
                2. Hedera Agent Kit Integration
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Our backend utilizes the **Hedera Agent Kit** plugins to register specialized tools for the AI agent. The agent operates under a secure human-in-the-loop (HITL) system:
              </p>
              <div className="bg-muted/40 p-4 rounded-xl border border-border/40 font-mono text-xs text-foreground mb-4 overflow-x-auto">
                <span className="text-muted-foreground"># Install Hedera Agent Kit</span><br />
                pip install hedera-agent-kit<br /><br />
                <span className="text-muted-foreground"># Initialize Client</span><br />
                client = Client.for_testnet()<br />
                client.set_operator(operator_id, private_key)
              </div>
            </div>

            {/* Trust State Machine */}
            <div id="state-machine" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Terminal size={20} className="text-primary" />
                3. Secure Trust Escrow State Machine
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                To guarantee zero-risk partnerships, Hello-Hedera-Pay enforces an strict state machine:
              </p>
              <ul className="flex flex-col gap-2.5 pl-4 list-disc text-sm text-muted-foreground">
                <li><strong className="text-foreground">PENDING:</strong> The milestone agreement is created and awaits payee deposit verification.</li>
                <li><strong className="text-foreground">ACTIVE:</strong> The payee deposits the Hbar value. Contractor accepts the lock.</li>
                <li><strong className="text-foreground">DELIVERED:</strong> Contractor marks deliverables as completed. Payee's unilateral cancel button is locked.</li>
                <li><strong className="text-foreground">DISPUTED:</strong> Payee requests cancellation post-delivery. Escrow is locked for AI/Multi-Sig mediation.</li>
                <li><strong className="text-foreground">SETTLED:</strong> The payment is successfully disbursed, loyalty cashbacks are minted, and NFT proof is generated.</li>
              </ul>
            </div>

            {/* HCS Audits */}
            <div id="hcs-audits" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Award size={20} className="text-primary" />
                4. HCS Audit Trail Receipts
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Every settlement event compiles an audit receipt including milestone parameters, consensus timestamps, and reward tokens. This is logged to **Hedera Consensus Service (HCS)** topic <code className="font-mono bg-muted/60 px-1 py-0.5 rounded text-foreground">0.0.9038204</code>, establishing verifiable cryptographic records on HashScan.
              </p>
            </div>

          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
