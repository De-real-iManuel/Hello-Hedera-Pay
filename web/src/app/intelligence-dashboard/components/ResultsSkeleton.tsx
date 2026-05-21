'use client';

import React from 'react';
import { motion } from 'framer-motion';

function SkeletonCard({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="glass-card rounded-2xl p-5 flex flex-col gap-4"
    >
      <div className="skeleton-pulse h-0.5 w-full rounded-full" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2 flex-1">
          <div className="skeleton-pulse h-3 w-24 rounded" />
          <div className="skeleton-pulse h-4 w-4/5 rounded" />
        </div>
        <div className="skeleton-pulse h-6 w-28 rounded-full flex-shrink-0" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="skeleton-pulse h-3 w-full rounded" />
        <div className="skeleton-pulse h-3 w-11/12 rounded" />
        <div className="skeleton-pulse h-3 w-4/5 rounded" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="skeleton-pulse h-3 w-28 rounded" />
        <div className="skeleton-pulse h-1.5 w-full rounded-full" />
      </div>
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={`skel-src-${i}`} className="skeleton-pulse h-5 w-24 rounded-md" />
        ))}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="skeleton-pulse h-3 w-48 rounded" />
        <div className="skeleton-pulse h-3 w-24 rounded" />
      </div>
    </motion.div>
  );
}

export default function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 px-1">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={`dot-${i}`}
              className="w-1.5 h-1.5 rounded-full bg-primary dot-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          Analyzing topic — surfacing hidden intelligence…
        </span>
      </div>
      {[0, 1, 2, 3].map((i) => (
        <SkeletonCard key={`skel-card-${i}`} delay={i * 0.1} />
      ))}
    </div>
  );
}