'use client';

import React, { useEffect, useState } from 'react';
import { Database, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TipRecord {
  id: string;
  topic: string;
  amount_hbar: number;
  transaction_id: string;
  hashscan_url: string;
  hcs_message_id: string;
  hcs_url: string;
  created_at: string;
}

export default function HCSPublicationsPage() {
  const { accessToken } = useAuth();
  const [tips, setTips] = useState<TipRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/history/tips?limit=50`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then(setTips)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Database size={16} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">HCS Publications</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-11">Your on-chain tip receipts published to Hedera Consensus Service.</p>
      </div>

      <div className="flex-1 p-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : tips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Database size={32} className="text-muted-foreground mb-4" />
            <p className="text-sm font-medium text-foreground mb-1">No HCS publications yet</p>
            <p className="text-xs text-muted-foreground">Tip a fact to publish your first on-chain receipt.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-3xl">
            {tips.map((tip) => (
              <div key={tip.id} className="glass-card rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-foreground line-clamp-1">{tip.topic}</span>
                    <span className="text-xs text-muted-foreground font-mono-data">{tip.transaction_id}</span>
                  </div>
                  <span className="text-sm font-bold text-primary font-mono-data flex-shrink-0">{tip.amount_hbar} HBAR</span>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    HCS #{tip.hcs_message_id} · {new Date(tip.created_at).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2 ml-auto">
                    <a href={tip.hashscan_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-opacity">
                      <ExternalLink size={11} /> Transaction
                    </a>
                    <a href={tip.hcs_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-opacity">
                      <ExternalLink size={11} /> HCS Record
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
