'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
} from 'recharts';

const networkData = [
  { t: '14:00', tps: 720 },
  { t: '14:05', tps: 815 },
  { t: '14:10', tps: 762 },
  { t: '14:15', tps: 903 },
  { t: '14:20', tps: 841 },
  { t: '14:25', tps: 788 },
  { t: '14:30', tps: 920 },
  { t: '14:35', tps: 847 },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="glass-card px-2.5 py-1.5 rounded-lg text-xs">
      <p className="text-muted-foreground font-mono-data">{label}</p>
      <p className="text-primary font-semibold font-mono-data">{payload[0].value} TPS</p>
    </div>
  );
}

export default function NetworkActivityChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={networkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="networkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="t" hide />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="tps"
          stroke="var(--primary)"
          strokeWidth={1.5}
          fill="url(#networkGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}