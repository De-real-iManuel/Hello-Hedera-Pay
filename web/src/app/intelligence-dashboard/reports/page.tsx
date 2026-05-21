'use client';

import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardShell } from '../DashboardShellContext';

interface QueryRecord {
  id: string;
  topic: string;
  fact_count: number;
  created_at: string;
}

export default function ReportsPage() {
  const { accessToken } = useAuth();
  const { onSelectQuery } = useDashboardShell();
  const [queries, setQueries] = useState<QueryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/history/queries?limit=50`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then(setQueries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText size={16} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Reports</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-11">Your past research sessions. Click any report to reload its facts.</p>
      </div>

      <div className="flex-1 p-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : queries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FileText size={32} className="text-muted-foreground mb-4" />
            <p className="text-sm font-medium text-foreground mb-1">No reports yet</p>
            <p className="text-xs text-muted-foreground">Run your first analysis to generate a report.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-3xl">
            {queries.map((q) => (
              <button
                key={q.id}
                onClick={() => onSelectQuery(q.topic)}
                className="glass-card rounded-xl p-4 flex items-center justify-between gap-3 text-left hover:border-primary/40 transition-all duration-200 group"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">{q.topic}</span>
                  <span className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleString()}</span>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{q.fact_count} facts</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
