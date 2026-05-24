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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <DashboardSidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((o) => !o)}
          onSelectQuery={onSelectQuery}
          recentQueries={recentQueries}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          />
          {/* Drawer body */}
          <div
            className="relative flex flex-col w-64 max-w-xs bg-card h-full shadow-2xl transition-transform duration-300 transform translate-x-0"
          >
            <DashboardSidebar
              open={true}
              onToggle={() => setSidebarOpen(false)}
              onSelectQuery={(q) => {
                onSelectQuery(q);
                setSidebarOpen(false); // Close drawer on selection
              }}
              recentQueries={recentQueries}
            />
          </div>
        </div>
      )}

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
