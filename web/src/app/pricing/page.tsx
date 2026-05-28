'use client';

import React from 'react';
import Link from 'next/link';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import { Check, Coins, ShieldAlert, Cpu } from 'lucide-react';

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden text-foreground flex flex-col justify-between">
      <LandingNavbar />

      <section className="relative px-6 py-24 md:py-32 max-w-6xl mx-auto flex-1 w-full">
        {/* Glow effect background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-primary/10 blur-[120px] pointer-events-none -z-10" />

        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest mb-4">
            <Coins size={12} />
            Pricing Plans
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Transparent Tiers for <span className="gradient-text">Enterprise Trust</span>
          </h1>
          <p className="text-base text-muted-foreground">
            Choose the volume capacity and multi-agent options that fit your corporate procurement agreements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Developer Tier */}
          <div className="glass-card p-8 rounded-2xl border border-border flex flex-col gap-6 relative overflow-hidden">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Developer</span>
              <h3 className="text-3xl font-extrabold mt-2">$0</h3>
              <p className="text-xs text-muted-foreground mt-1">Free for hackathons & local testing</p>
            </div>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground flex-1">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-primary flex-shrink-0" />
                <span>Testnet HBAR operations</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-primary flex-shrink-0" />
                <span>Default HCS Topic audits</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-primary flex-shrink-0" />
                <span>Standard ReAct AI agent chat</span>
              </li>
            </ul>
            <Link
              href="/intelligence-dashboard"
              className="w-full py-3 text-center text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl transition duration-200"
            >
              Get Started
            </Link>
          </div>

          {/* Business Tier */}
          <div className="glass-card p-8 rounded-2xl border-2 border-primary/50 flex flex-col gap-6 relative overflow-hidden shadow-xl scale-105">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl">
              Popular
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Business Pro</span>
              <h3 className="text-3xl font-extrabold mt-2">$89<span className="text-sm font-normal text-muted-foreground">/mo</span></h3>
              <p className="text-xs text-muted-foreground mt-1">For growing startups & merchant partners</p>
            </div>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground flex-1">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-primary flex-shrink-0" />
                <span className="text-foreground">Unlimited Active Milestones</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-primary flex-shrink-0" />
                <span>Custom HCS Topic configuration</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-primary flex-shrink-0" />
                <span>Dedicated dispute lock states</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-primary flex-shrink-0" />
                <span>Enterprise voice recognition API</span>
              </li>
            </ul>
            <Link
              href="/intelligence-dashboard"
              className="w-full py-3 text-center text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl shadow-lg transition duration-200"
            >
              Launch Dashboard
            </Link>
          </div>

          {/* Enterprise Tier */}
          <div className="glass-card p-8 rounded-2xl border border-border flex flex-col gap-6 relative overflow-hidden">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Enterprise Vault</span>
              <h3 className="text-3xl font-extrabold mt-2">Custom</h3>
              <p className="text-xs text-muted-foreground mt-1">For corporate treasuries & high volumes</p>
            </div>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground flex-1">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-primary flex-shrink-0" />
                <span>Multi-sig escrow treasury signers</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-primary flex-shrink-0" />
                <span>SLAs for HCS mirror nodes</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-primary flex-shrink-0" />
                <span>Custom LLM hosting & fine-tuning</span>
              </li>
            </ul>
            <Link
              href="mailto:enterprise@hellohederapay.com"
              className="w-full py-3 text-center text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl transition duration-200"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
