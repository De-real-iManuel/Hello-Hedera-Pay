'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import AuthGuard from '@/components/AuthGuard';
import DashboardSidebar from './components/DashboardSidebar';
import DashboardTopbar from './components/DashboardTopbar';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletConnect } from '@/hooks/useWalletConnect';
import { DashboardShellProvider, useDashboardShell } from './DashboardShellContext';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { recentQueries } = useDashboardShell();
  const { signOut } = useAuth();
  const { isConnected, accountId, connect, disconnect } = useWalletConnect();

  const handleConnect = async () => {
    try {
      await connect();
    } catch {
      toast.error('Wallet connection failed. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    toast.info('Wallet disconnected.');
  };

  const handleSignOut = async () => {
    await signOut();
    toast.info('Signed out.');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
        onSelectQuery={() => {}}
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
