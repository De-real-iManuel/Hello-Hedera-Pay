'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const DashboardLayout = dynamic(() => import('./components/DashboardLayout'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 h-full overflow-hidden animate-pulse">
      <div className="w-80 xl:w-96 flex-shrink-0 border-r border-border bg-muted/30" />
      <div className="flex-1 p-5 flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 rounded-xl bg-muted" />
          <div className="h-24 rounded-xl bg-muted" />
        </div>
        <div className="h-48 rounded-2xl bg-muted" />
        <div className="h-48 rounded-2xl bg-muted" />
      </div>
    </div>
  ),
});

export default function IntelligenceDashboardPage() {
  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <DashboardLayout />
    </div>
  );
}
