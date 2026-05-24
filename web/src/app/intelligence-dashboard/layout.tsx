'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';

const DashboardSidebar = dynamic(() => import('./components/DashboardSidebar'), {
  ssr: false,
  loading: () => <div className="w-64 flex-shrink-0 bg-background border-r border-border animate-pulse" />,
});
const DashboardTopbar = dynamic(() => import('./components/DashboardTopbar'), {
  ssr: false,
  loading: () => <div className="h-14 border-b border-border bg-background animate-pulse" />,
});
import { DashboardShellProvider, useDashboardShell } from './DashboardShellContext';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { recentQueries, wallet, onSelectQuery } = useDashboardShell();
  const { signOut } = useAuth();
  const { isConnected, accountId, connect, disconnect } = wallet;

  const handleConnect = async () => {
    try { await connect(); }
    catch { toast.error('Wallet connection failed. Please try again.'); }
  };

  const handleDisconnect = async () => {
    await disconnect();
    toast.info('Wallet disconnected.');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
        onSelectQuery={onSelectQuery}
        recentQueries={recentQueries}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <DashboardTopbar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          isConnected={isConnected}
          accountId={accountId}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShellProvider>
        <DashboardShell>{children}</DashboardShell>
      </DashboardShellProvider>
    </AuthGuard>
  );
}
