'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  Database,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Clock,
  Activity,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RecentQuery } from '../DashboardShellContext';

const navItems = [
  { key: 'nav-dashboard', icon: LayoutDashboard, label: 'Intelligence Hub', href: '/intelligence-dashboard' },
  { key: 'nav-hcs', icon: Database, label: 'HCS Publications', href: '/intelligence-dashboard/hcs-publications' },
  { key: 'nav-reports', icon: FileText, label: 'Reports', href: '/intelligence-dashboard/reports' },
  { key: 'nav-registry', icon: BookOpen, label: 'HOL Registry', href: '/intelligence-dashboard/hol-registry' },
  { key: 'nav-activity', icon: Activity, label: 'Network Activity', href: '/intelligence-dashboard/network-activity' },
];

const bottomItems = [
  { key: 'nav-settings', icon: Settings, label: 'Settings', href: '/intelligence-dashboard/settings' },
  { key: 'nav-help', icon: HelpCircle, label: 'Help & Support', href: '#' },
];

interface Props {
  open: boolean;
  onToggle: () => void;
  onSelectQuery: (query: string) => void;
  recentQueries: RecentQuery[];
}

export default function DashboardSidebar({ open, onToggle, onSelectQuery, recentQueries }: Props) {
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: open ? 260 : 64 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex-shrink-0 bg-card border-r border-border flex flex-col overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-border flex-shrink-0">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <AppLogo size={28} />
          <AnimatePresence>
            {open && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-semibold text-sm text-foreground whitespace-nowrap overflow-hidden"
              >
                Hello<span className="gradient-text">-Hedera-Pay</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200 z-10"
        aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {open ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 p-2 flex-shrink-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <item.icon size={16} className="flex-shrink-0" />
              <AnimatePresence>
                {open && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!open && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-card border border-border rounded-md text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Recent queries */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col flex-1 overflow-hidden px-2 pb-2"
          >
            <div className="flex items-center gap-2 px-3 py-3 mt-2">
              <Clock size={12} className="text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Recent Queries
              </span>
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto scrollbar-thin flex-1">
              {recentQueries.length === 0 ? (
                <p className="px-3 py-2 text-xs text-muted-foreground italic">
                  No queries yet — run your first analysis.
                </p>
              ) : (
                recentQueries.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectQuery(item.query)}
                    className="flex flex-col gap-1 px-3 py-2.5 rounded-lg hover:bg-muted/60 text-left transition-all duration-150 group"
                  >
                    <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors duration-150 leading-snug line-clamp-2">
                      {item.query}
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                      <span className="text-xs text-muted-foreground">{item.results} results</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom items */}
      <div className="flex flex-col gap-1 p-2 border-t border-border flex-shrink-0">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <item.icon size={16} className="flex-shrink-0" />
              <AnimatePresence>
                {open && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!open && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-card border border-border rounded-md text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </motion.aside>
  );
}
