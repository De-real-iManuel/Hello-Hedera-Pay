'use client';

import React from 'react';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardShell } from '../DashboardShellContext';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { wallet } = useDashboardShell();

  const handleSignOut = async () => {
    await signOut();
    toast.info('Signed out.');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings size={16} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-11">Manage your account and wallet settings.</p>
      </div>

      <div className="flex-1 p-8 flex flex-col gap-6 max-w-lg">
        {/* Account */}
        <div className="glass-card rounded-xl p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-foreground">Account</h2>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Email</span>
            <span className="text-sm text-foreground">{user?.email ?? '—'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">User ID</span>
            <span className="text-xs font-mono-data text-muted-foreground">{user?.id ?? '—'}</span>
          </div>
        </div>

        {/* Wallet */}
        <div className="glass-card rounded-xl p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-foreground">Wallet</h2>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Status</span>
            <span className={`text-sm font-medium ${wallet.isConnected ? 'text-primary' : 'text-muted-foreground'}`}>
              {wallet.isConnected ? 'Connected' : 'Not connected'}
            </span>
          </div>
          {wallet.accountId && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Account ID</span>
              <span className="text-sm font-mono-data text-foreground">{wallet.accountId}</span>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Network</span>
            <span className="text-sm text-foreground capitalize">{process.env.NEXT_PUBLIC_HEDERA_NETWORK ?? 'testnet'}</span>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200 w-fit"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </div>
  );
}
