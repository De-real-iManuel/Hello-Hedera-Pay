'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { useWalletConnect, UseWalletConnectReturn } from '@/hooks/useWalletConnect';
import { useAuth } from '@/contexts/AuthContext';

export interface RecentQuery {
  id: string;
  query: string;
  time: string;
  results: number;
}

interface DashboardShellContextValue {
  recentQueries: RecentQuery[];
  addRecentQuery: (q: RecentQuery) => void;
  wallet: UseWalletConnectReturn;
  onSelectQuery: (query: string) => void;
  setOnSelectQuery: (fn: (query: string) => void) => void;
}

const DashboardShellContext = createContext<DashboardShellContextValue>({
  recentQueries: [],
  addRecentQuery: () => {},
  wallet: {
    isConnected: false,
    accountId: null,
    connect: async () => {},
    disconnect: async () => {},
    sendHbar: async () => { throw new Error('Not initialised'); },
  },
  onSelectQuery: () => {},
  setOnSelectQuery: () => {},
});

export function DashboardShellProvider({ children }: { children: React.ReactNode }) {
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([]);
  const wallet = useWalletConnect();
  const { accessToken } = useAuth();
  const onSelectQueryRef = useRef<(query: string) => void>(() => {});

  useEffect(() => {
    if (!accessToken) return;
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history/queries?limit=15`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const mapped: RecentQuery[] = data.map((q: any) => {
            const date = new Date(q.created_at);
            return {
              id: q.id,
              query: q.topic,
              time: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
              results: q.fact_count,
            };
          });
          setRecentQueries(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch query history:', err);
      }
    };
    fetchHistory();
  }, [accessToken]);

  const addRecentQuery = (q: RecentQuery) => {
    setRecentQueries((prev) => [
      q,
      ...prev.filter((r) => r.query !== q.query).slice(0, 9),
    ]);
  };

  const setOnSelectQuery = useCallback((fn: (query: string) => void) => {
    onSelectQueryRef.current = fn;
  }, []);

  const onSelectQuery = useCallback((query: string) => {
    onSelectQueryRef.current(query);
  }, []);

  return (
    <DashboardShellContext.Provider value={{ recentQueries, addRecentQuery, wallet, onSelectQuery, setOnSelectQuery }}>
      {children}
    </DashboardShellContext.Provider>
  );
}

export function useDashboardShell() {
  return useContext(DashboardShellContext);
}
