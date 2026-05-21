'use client';

import React from 'react';
import { Activity, Wifi, ArrowUp, ArrowDown } from 'lucide-react';
import dynamic from 'next/dynamic';

// Backend integration point: replace with real Hedera network stats API
const NetworkChart = dynamic(() => import('./NetworkActivityChart'), { ssr: false });

export default function NetworkActivityWidget() {
  return (
    <div className="glass-card rounded-xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
            <Activity size={14} className="text-accent" />
          </div>
          <span className="text-sm font-semibold text-foreground">Network Activity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary network-pulse" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-foreground font-mono-data">2.1s</span>
          <span className="text-xs text-muted-foreground">Avg Consensus</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-foreground font-mono-data">99.3%</span>
            <ArrowUp size={10} className="text-primary" />
          </div>
          <span className="text-xs text-muted-foreground">Uptime</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-foreground font-mono-data">847</span>
            <ArrowDown size={10} className="text-amber-400" />
          </div>
          <span className="text-xs text-muted-foreground">TPS</span>
        </div>
      </div>

      {/* Sparkline chart */}
      <div className="h-16">
        <NetworkChart />
      </div>

      {/* Node status */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <div className="flex items-center gap-1.5">
          <Wifi size={11} className="text-primary" />
          <span className="text-xs text-muted-foreground">Connected to Mainnet</span>
        </div>
        <span className="text-xs font-mono-data text-muted-foreground">0.0.3</span>
      </div>
    </div>
  );
}