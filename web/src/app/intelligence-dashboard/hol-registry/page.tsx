import React from 'react';
import { BookOpen } from 'lucide-react';

export default function HOLRegistryPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen size={16} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">HOL Registry</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-11">Verified on-chain entity registry — coming soon.</p>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <BookOpen size={40} className="text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">HOL Registry</p>
          <p className="text-xs text-muted-foreground max-w-xs">Entity verification against the Hedera On-Ledger registry will be available in a future update.</p>
        </div>
      </div>
    </div>
  );
}
