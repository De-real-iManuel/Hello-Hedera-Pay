'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ExternalLink,
  Clock,
  Database,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Loader2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types matching the backend /analyze response
// ---------------------------------------------------------------------------
interface Fact {
  id: string;
  title: string;
  summary: string;
  confidence: number; // 0.0–1.0
  sources: string[];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 85
      ? 'from-primary to-accent'
      : pct >= 70
      ? 'from-yellow-500 to-amber-400'
      : 'from-orange-500 to-red-500';
  const textColor =
    pct >= 85 ? 'text-primary' : pct >= 70 ? 'text-amber-400' : 'text-orange-400';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
      <span className={`text-sm font-semibold font-mono-data ${textColor}`}>{pct}%</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton card shown while loading
// ---------------------------------------------------------------------------
function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 animate-pulse">
      <div className="h-3 w-24 skeleton-pulse rounded" />
      <div className="h-4 w-4/5 skeleton-pulse rounded" />
      <div className="flex flex-col gap-2">
        <div className="h-3 w-full skeleton-pulse rounded" />
        <div className="h-3 w-11/12 skeleton-pulse rounded" />
        <div className="h-3 w-3/4 skeleton-pulse rounded" />
      </div>
      <div className="h-1.5 w-full skeleton-pulse rounded-full" />
      <div className="flex gap-2">
        <div className="h-5 w-20 skeleton-pulse rounded-md" />
        <div className="h-5 w-24 skeleton-pulse rounded-md" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main section
// ---------------------------------------------------------------------------
const DEMO_TOPIC = 'Hedera governance and HBAR ecosystem hidden insights 2026';

export default function DemoPreviewSection() {
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchDemo() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: DEMO_TOPIC }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setFacts(data.facts ?? []);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDemo();
    return () => { cancelled = true; };
  }, []);

  return (
    <section id="demo" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 xl:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 mb-5">
            <TrendingUp size={12} className="text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Live Intelligence Sample
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            What the platform
            <span className="gradient-text"> actually finds</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Live outputs from the AI research pipeline — confidence-scored and ready for Hedera publication.
          </p>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin text-primary" />
              Running live intelligence query…
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
              {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground mb-4">
              Could not load live demo — backend may be starting up.
            </p>
            <a href="/intelligence-dashboard" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm">
              Try it yourself
              <ArrowRight size={14} />
            </a>
          </div>
        )}

        {/* Results */}
        {!loading && !error && facts.length > 0 && (
          <>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-5"
            >
              {facts.map((fact) => {
                const pct = Math.round(fact.confidence * 100);
                return (
                  <motion.div
                    key={fact.id}
                    variants={{
                      hidden: { opacity: 0, y: 28 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
                    }}
                    whileHover={{ y: -3 }}
                    className="glass-card-hover rounded-2xl p-6 flex flex-col gap-5"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          AI Research
                        </span>
                        <h3 className="text-sm font-semibold text-foreground leading-snug">
                          {fact.title}
                        </h3>
                      </div>
                      {pct >= 85 ? (
                        <span className="hcs-badge flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0">
                          <CheckCircle2 size={11} />
                          High Confidence
                        </span>
                      ) : (
                        <span className="hcs-badge-pending flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0">
                          <Clock size={11} />
                          Moderate
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {fact.summary}
                    </p>

                    {/* Confidence */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-medium text-muted-foreground">Confidence Score</span>
                      <ConfidenceBar value={fact.confidence} />
                    </div>

                    {/* Sources */}
                    {fact.sources.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Sources ({fact.sources.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {fact.sources.slice(0, 3).map((src, i) => (
                            <span
                              key={`${fact.id}-src-${i}`}
                              className="px-2 py-0.5 rounded-md bg-muted border border-border text-xs text-muted-foreground truncate max-w-[160px]"
                              title={src}
                            >
                              {src.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                            </span>
                          ))}
                          {fact.sources.length > 3 && (
                            <span className="px-2 py-0.5 rounded-md bg-muted border border-border text-xs text-muted-foreground">
                              +{fact.sources.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center mt-12"
            >
              <p className="text-sm text-muted-foreground mb-4">
                These are live results from the AI pipeline. Your queries produce results in the same format, published to the Hedera Consensus Service.
              </p>
              <a
                href="/intelligence-dashboard"
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-base rounded-lg"
              >
                Run Your First Query
                <ArrowRight size={16} />
              </a>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
