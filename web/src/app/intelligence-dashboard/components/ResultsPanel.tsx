'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import { IntelligenceResult } from '@/types/intelligence';
import IntelligenceCard from './IntelligenceCard';
import ResultsSkeleton from './ResultsSkeleton';
import HCSStatusWidget from './HCSStatusWidget';
import NetworkActivityWidget from './NetworkActivityWidget';

interface Props {
  results: IntelligenceResult[];
  isAnalyzing: boolean;
  activeQuery: string;
}

export default function ResultsPanel({ results, isAnalyzing, activeQuery }: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-foreground">Intelligence Results</h2>
          {results.length > 0 && !isAnalyzing && (
            <p className="text-xs text-muted-foreground">
              {results.length} findings — sorted by confidence score
            </p>
          )}
        </div>
        {results.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {results.filter((r) => r.hcsStatus === 'published').length} HCS published
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-xs text-muted-foreground">
              {results.filter((r) => r.holStatus === 'registered').length} HOL matched
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-5 flex flex-col gap-5">
          {/* Widget row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <HCSStatusWidget />
            <NetworkActivityWidget />
          </div>

          {/* Results or skeleton or empty */}
          {isAnalyzing ? (
            <ResultsSkeleton />
          ) : results.length === 0 ? (
            <EmptyResultsState />
          ) : (
            <AnimatePresence>
              <motion.div
                className="flex flex-col gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {results.map((result, i) => (
                  <IntelligenceCard key={result.id} result={result} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyResultsState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-24 px-8 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-muted/60 border border-border flex items-center justify-center mb-5">
        <Search size={22} className="text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">No intelligence results yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
        Enter a research topic in the left panel and click Analyze Topic to surface hidden facts,
        confidence scores, and Hedera publication status.
      </p>
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 bg-primary/8">
        <Sparkles size={13} className="text-primary" />
        <span className="text-xs font-medium text-primary">
          Try: &quot;Hedera governance changes Q1 2026&quot;
        </span>
      </div>
    </motion.div>
  );
}