'use client';

import React from 'react';
import { Database, CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

const publications = [
  { id: 'pub-001', topicId: '0.0.4821047', status: 'confirmed' as const, age: '2 min ago' },
  { id: 'pub-002', topicId: '0.0.4821051', status: 'confirmed' as const, age: '18 min ago' },
  { id: 'pub-003', topicId: '0.0.4821060', status: 'pending' as const, age: 'Just now' },
  { id: 'pub-004', topicId: '0.0.4820998', status: 'confirmed' as const, age: '1h ago' },
];

function StatusIcon({ status }: { status: 'confirmed' | 'pending' | 'failed' }) {
  if (status === 'confirmed') return <CheckCircle2 size={12} className="text-primary" />;
  if (status === 'pending') return <Clock size={12} className="text-amber-400" />;
  return <AlertTriangle size={12} className="text-red-400" />;
}

export default function HCSStatusWidget() {
  const confirmed = publications.filter((p) => p.status === 'confirmed').length;
  const pending = publications.filter((p) => p.status === 'pending').length;

  return (
    <div className="glass-card rounded-xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Database size={14} className="text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">HCS Publications</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp size={12} className="text-primary" />
          <span className="text-xs font-medium text-primary">+12 today</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-0.5 px-3 py-2 rounded-lg bg-primary/8 border border-primary/15">
          <span className="text-lg font-bold text-primary font-mono-data">{confirmed}</span>
          <span className="text-xs text-muted-foreground">Confirmed</span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2 rounded-lg bg-amber-500/8 border border-amber-500/15">
          <span className="text-lg font-bold text-amber-400 font-mono-data">{pending}</span>
          <span className="text-xs text-muted-foreground">Pending</span>
        </div>
      </div>

      {/* Recent publications */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          Recent
        </span>
        {publications.map((pub) => (
          <div key={pub.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <StatusIcon status={pub.status} />
              <span className="text-xs font-mono-data text-muted-foreground truncate">
                {pub.topicId}
              </span>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">{pub.age}</span>
          </div>
        ))}
      </div>
    </div>
  );
}