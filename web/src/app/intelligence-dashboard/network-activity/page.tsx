'use client';

import React from 'react';
import { Activity, Wifi, ArrowUp } from 'lucide-react';
import dynamic from 'next/dynamic';

const NetworkActivityChart = dynamic(() => import('../components/NetworkActivityChart'), { ssr: false });

const stats = [
  { label: 'Avg Consensus Time', value: '2.1s', sub: 'per transaction' },
  { label: 'Network Uptime', value: '99.3%', sub: 'last 30 days' },
  { label: 'Current TPS', value: '847', sub: 'transactions/sec' },
  { label: 'Active Nodes', value: '29', sub: 'governing council' },
];

export default function NetworkActivityPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Activity size={16} className="text-accent" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Network Activity</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-11">Live Hedera network performance metrics.</p>
      </div>

      <div className="flex-1 p-8 flex flex-col gap-6 max-w-4xl">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30 w-fit">
          <Wifi size={13} className="text-primary" />
          <span className="text-sm font-medium text-foreground capitalize">
            {process.env.NEXT_PUBLIC_HEDERA_NETWORK ?? 'testnet'}
          </span>
          <span className="w-px h-3 bg-border" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary network-pulse" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-card rounded-xl p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-foreground font-mono-data">{s.value}</span>
                <ArrowUp size={12} className="text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">{s.label}</span>
              <span className="text-xs text-muted-foreground">{s.sub}</span>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">TPS — Last Hour</span>
            <span className="text-xs text-muted-foreground font-mono-data">Updates every 5 min</span>
          </div>
          <div className="h-48">
            <NetworkActivityChart />
          </div>
        </div>
      </div>
    </div>
  );
}
