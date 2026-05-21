'use client';

import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { useWalletConnect, UseWalletConnectReturn } from '@/hooks/useWalletConnect';

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
  const onSelectQueryRef = useRef<(query: string) => void>(() => {});

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
