'use client';

import React, { createContext, useContext, useState } from 'react';

export interface RecentQuery {
  id: string;
  query: string;
  time: string;
  results: number;
}

interface DashboardShellContextValue {
  recentQueries: RecentQuery[];
  addRecentQuery: (q: RecentQuery) => void;
}

const DashboardShellContext = createContext<DashboardShellContextValue>({
  recentQueries: [],
  addRecentQuery: () => {},
});

export function DashboardShellProvider({ children }: { children: React.ReactNode }) {
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([]);

  const addRecentQuery = (q: RecentQuery) => {
    setRecentQueries((prev) => [
      q,
      ...prev.filter((r) => r.query !== q.query).slice(0, 9),
    ]);
  };

  return (
    <DashboardShellContext.Provider value={{ recentQueries, addRecentQuery }}>
      {children}
    </DashboardShellContext.Provider>
  );
}

export function useDashboardShell() {
  return useContext(DashboardShellContext);
}
