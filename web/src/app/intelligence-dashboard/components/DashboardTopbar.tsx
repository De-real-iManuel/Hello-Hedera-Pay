'use client';

import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Menu, Wifi, Wallet, LogOut, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  isConnected: boolean;
  accountId: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onSignOut: () => void;
  onSearch?: (query: string) => void;
}

export default function DashboardTopbar({
  onToggleSidebar,
  isConnected,
  accountId,
  onConnect,
  onDisconnect,
  onSignOut,
  onSearch,
}: Props) {
  const [searchValue, setSearchValue] = useState('');
  const { user } = useAuth();

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim().length >= 8 && onSearch) {
      onSearch(searchValue.trim());
      setSearchValue('');
    }
  };

  // Truncate long account IDs for display
  const displayAccountId = accountId
    ? accountId.length > 16
      ? `${accountId.slice(0, 10)}…${accountId.slice(-6)}`
      : accountId
    : null;

  // Show first letter of email or account ID for avatar
  const avatarLetter = user?.email
    ? user.email[0].toUpperCase()
    : accountId
    ? accountId.slice(-1).toUpperCase()
    : 'U';

  const displayName = user?.email
    ? user.email.split('@')[0]
    : isConnected && displayAccountId
    ? displayAccountId
    : 'Guest';

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 flex-shrink-0">
      {/* Mobile hamburger */}
      <button
        onClick={onToggleSidebar}
        className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu size={18} />
      </button>

      {/* Global search — fires onSearch on Enter */}
      <div className="flex-1 max-w-md relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Type a topic and press Enter to analyze…"
          className="w-full bg-muted/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/80 transition-all duration-200"
        />
      </div>

      {/* Network status */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/30">
        <Wifi size={12} className="text-primary" />
        <span className="text-xs font-medium text-foreground capitalize">
          {process.env.NEXT_PUBLIC_HEDERA_NETWORK ?? 'testnet'}
        </span>
        <span className="w-px h-3 bg-border" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary network-pulse" />
        <span className="text-xs text-muted-foreground font-mono-data">2.1s avg</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Wallet connect / disconnect */}
        {isConnected ? (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/30">
              <Wallet size={12} className="text-primary" />
              <span className="text-xs font-mono-data text-foreground">{displayAccountId}</span>
            </div>
            <button
              onClick={onDisconnect}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200 text-xs font-medium"
              aria-label="Disconnect wallet"
            >
              <Wallet size={12} />
              <span className="hidden sm:inline">Disconnect</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onConnect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/60 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary transition-all duration-200 text-xs font-medium"
            aria-label="Connect wallet"
          >
            <Wallet size={12} />
            <span>Connect Wallet</span>
          </button>
        )}

        {/* Notifications */}
        <button
          className="relative w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200"
          aria-label="Notifications"
        >
          <Bell size={15} />
        </button>

        {/* User menu */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border hover:border-primary/40 transition-all duration-200">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
              {avatarLetter}
            </div>
            <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown size={12} className="text-muted-foreground" />
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-44 glass-card rounded-xl border border-border shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 z-50">
            <div className="p-1">
              {user?.email && (
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              )}
              <button
                onClick={onSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150"
              >
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
