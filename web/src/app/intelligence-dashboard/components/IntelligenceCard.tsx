'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  Database,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Share2,
} from 'lucide-react';
import { IntelligenceResult } from '@/types/intelligence';
import { toast } from 'sonner';

interface Props {
  result: IntelligenceResult;
  index: number;
}

function ConfidenceBar({ value }: { value: number }) {
  const colorClass =
    value >= 85
      ? 'from-primary to-accent'
      : value >= 70
      ? 'from-yellow-500 to-amber-400' :'from-orange-500 to-red-500';

  const textColor =
    value >= 85 ? 'text-primary' : value >= 70 ? 'text-amber-400' : 'text-orange-400';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
          className={`h-full rounded-full bg-gradient-to-r ${colorClass}`}
        />
      </div>
      <span className={`text-sm font-bold font-mono-data min-w-[3ch] text-right ${textColor}`}>
        {value}%
      </span>
    </div>
  );
}

function HCSStatusBadge({ status }: { status: 'published' | 'pending' | 'failed' }) {
  if (status === 'published') {
    return (
      <span className="hcs-badge flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0">
        <CheckCircle2 size={11} />
        HCS Published
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="hcs-badge-pending flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0">
        <Clock size={11} />
        Queued
      </span>
    );
  }
  return (
    <span className="hcs-badge-failed flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0">
      <AlertTriangle size={11} />
      Publish Failed
    </span>
  );
}

export default function IntelligenceCard({ result, index }: Props) {
  const [expanded, setExpanded] = useState(false);

  const handleCopyTxId = () => {
    if (result.txId) {
      navigator.clipboard.writeText(result.txId);
      toast.success('Transaction ID copied to clipboard');
    }
  };

  const handleShare = () => {
    toast.success('Intelligence link copied to clipboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
      className="glass-card-hover rounded-2xl overflow-hidden"
    >
      {/* Confidence accent bar at top */}
      <div
        className="h-0.5 w-full"
        style={{
          background:
            result.confidence >= 85
              ? 'linear-gradient(90deg, var(--primary), var(--accent))'
              : result.confidence >= 70
              ? 'linear-gradient(90deg, #F59E0B, #FCD34D)'
              : 'linear-gradient(90deg, #EF4444, #F97316)',
        }}
      />

      <div className="p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {result.category}
              </span>
              {result.holStatus === 'registered' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
                  <BookOpen size={10} />
                  HOL Matched
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-foreground leading-snug">
              {result.title}
            </h3>
          </div>
          <HCSStatusBadge status={result.hcsStatus} />
        </div>

        {/* Content */}
        <div className="relative">
          <p className={`text-sm text-muted-foreground leading-relaxed ${!expanded ? 'line-clamp-3' : ''}`}>
            {result.content}
          </p>
          {result.content.length > 220 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-primary mt-1.5 hover:opacity-80 transition-opacity"
            >
              {expanded ? (
                <>Show less <ChevronUp size={12} /></>
              ) : (
                <>Read full insight <ChevronDown size={12} /></>
              )}
            </button>
          )}
        </div>

        {/* Confidence */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Confidence Score</span>
            <span className="text-xs text-muted-foreground">
              {result.confidence >= 85
                ? 'High confidence — auto-published'
                : result.confidence >= 70
                ? 'Moderate confidence — review recommended' :'Low confidence — manual verification required'}
            </span>
          </div>
          <ConfidenceBar value={result.confidence} />
        </div>

        {/* Sources */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Sources ({result.sources.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {result.sources.map((source, i) => (
              <span
                key={`${result.id}-src-${i}`}
                className="px-2 py-0.5 rounded-md bg-muted border border-border text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all duration-150 cursor-default"
              >
                {source}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            {result.txId ? (
              <button
                onClick={handleCopyTxId}
                className="flex items-center gap-1.5 group"
                title="Copy Transaction ID"
              >
                <Database size={11} className="text-primary flex-shrink-0" />
                <span className="text-xs font-mono-data text-muted-foreground group-hover:text-primary transition-colors truncate max-w-[220px]">
                  {result.txId}
                </span>
                <ExternalLink size={10} className="text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ) : (
              <span className="text-xs text-muted-foreground">No HCS record yet</span>
            )}
            <span className="text-xs text-muted-foreground font-mono-data">
              {result.timestamp.replace('T', ' ').replace('Z', ' UTC')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200"
              title="Share intelligence"
            >
              <Share2 size={12} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}