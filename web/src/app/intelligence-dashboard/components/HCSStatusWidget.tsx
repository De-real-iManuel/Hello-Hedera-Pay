'use client';

import React, { useEffect, useState } from 'react';
import { Database, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TipRecord {
  id: string;
  transaction_id: string;
  hcs_message_id: string;
  hcs_url: string;
  created_at: string;
}

export default function HCSStatusWidget() {
  const { accessToken } = useAuth();
  const [tips, setTips] = useState<TipRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/history/tips?limit=5`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then(setTips)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  const confirmed = tips.filter((t) => t.hcs_message_id !== 'pending').length;
  const pending = tips.filter((t) => t.hcs_message_id === 'pending').length;

  return (
    <div className="glass-card rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Database size={14} className="text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground">HCS Publications</span>
      </div>

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

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Recent</span>
        {loading ? (
          <div className="flex items-center gap-2 py-1">
            <div className="w-3 h-3 rounded-full border border-primary border-t-transparent animate-spin" />
            <span className="text-xs text-muted-foreground">Loading...</span>
          </div>
        ) : tips.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No publications yet — tip a fact to publish on-chain.</p>
        ) : (
          tips.map((tip) => (
            <div key={tip.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {tip.hcs_message_id !== 'pending'
                  ? <CheckCircle2 size={12} className="text-primary flex-shrink-0" />
                  : <Clock size={12} className="text-amber-400 flex-shrink-0" />
                }
                <span className="text-xs font-mono-data text-muted-foreground truncate">
                  #{tip.hcs_message_id !== 'pending' ? tip.hcs_message_id : 'pending'}
                </span>
              </div>
              <a href={tip.hcs_url} target="_blank" rel="noopener noreferrer"
                className="text-primary hover:opacity-70 transition-opacity flex-shrink-0">
                <ExternalLink size={11} />
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
