'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Search,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Globe,
  Database,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QueryFormData {
  topic: string;
}

interface Props {
  onAnalyze: (topic: string) => void;
  isAnalyzing: boolean;
  activeQuery: string;
}

const exampleQueries = [
  { id: 'ex-1', text: 'Recent Hedera governance changes' },
  { id: 'ex-2', text: 'Nigeria electricity sector hidden issues' },
  { id: 'ex-3', text: 'CBDC interoperability gaps 2026' },
  { id: 'ex-4', text: 'Stablecoin reserve audit discrepancies' },
  { id: 'ex-5', text: 'HOL registry entity verification failures' },
];

const agentSteps = [
  { id: 'step-crawl', icon: Globe, label: 'Web Intelligence Crawl', duration: 800 },
  { id: 'step-analyze', icon: Cpu, label: 'Multi-Agent Analysis', duration: 1200 },
  { id: 'step-score', icon: CheckCircle2, label: 'Confidence Scoring', duration: 600 },
  { id: 'step-publish', icon: Database, label: 'HCS Publication Queue', duration: 600 },
];

export default function QueryPanel({ onAnalyze, isAnalyzing, activeQuery }: Props) {
  const [agentProgress, setAgentProgress] = useState<number>(-1);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<QueryFormData>();

  const onSubmit = async (data: QueryFormData) => {
    setAgentProgress(0);
    onAnalyze(data.topic);

    // Simulate agent step progression
    for (let i = 0; i < agentSteps.length; i++) {
      await new Promise((r) => setTimeout(r, agentSteps[i].duration));
      setAgentProgress(i + 1);
    }
    setTimeout(() => setAgentProgress(-1), 1000);
  };

  return (
    <div className="flex flex-col h-full p-5 gap-6">
      {/* Panel header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-foreground">Intelligence Query</h2>
        <p className="text-xs text-muted-foreground">
          Enter a topic to surface hidden facts, scored and published to Hedera.
        </p>
      </div>

      {/* Query form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="topic-input" className="text-xs font-medium text-foreground">
            Research Topic
          </label>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-3 text-muted-foreground pointer-events-none"
            />
            <textarea
              id="topic-input"
              rows={4}
              placeholder="e.g. Recent Hedera governance changes, Nigeria electricity sector hidden issues…"
              className={`w-full bg-input border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:bg-muted/30 transition-all duration-200 resize-none scrollbar-thin ${
                errors.topic ? 'border-red-500/60' : 'border-border'
              }`}
              {...register('topic', {
                required: 'A research topic is required.',
                minLength: { value: 8, message: 'Topic must be at least 8 characters.' },
                maxLength: { value: 500, message: 'Topic must be under 500 characters.' },
              })}
              disabled={isAnalyzing}
            />
          </div>
          {errors.topic && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertCircle size={11} />
              {errors.topic.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isAnalyzing}
          className="btn-primary flex items-center justify-center gap-2 py-2.5 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Analyzing…</span>
            </>
          ) : (
            <>
              <Sparkles size={15} />
              <span>Analyze Topic</span>
            </>
          )}
        </button>
      </form>

      {/* Example queries */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          Example Topics
        </span>
        <div className="flex flex-col gap-1">
          {exampleQueries.map((q) => (
            <button
              key={q.id}
              onClick={() => setValue('topic', q.text)}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={11} className="flex-shrink-0 group-hover:text-primary transition-colors" />
              {q.text}
            </button>
          ))}
        </div>
      </div>

      {/* Agent Status Widget */}
      <div className="flex flex-col gap-3 mt-auto">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Agent Status
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isAnalyzing ? 'bg-amber-400 animate-pulse' : 'bg-primary'}`} />
            <span className="text-xs text-muted-foreground">
              {isAnalyzing ? 'Running' : 'Ready'}
            </span>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 flex flex-col gap-3">
          {agentSteps.map((step, i) => {
            const isComplete = agentProgress > i;
            const isActive = agentProgress === i && isAnalyzing;
            return (
              <div key={step.id} className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isComplete
                      ? 'bg-primary/20 text-primary'
                      : isActive
                      ? 'bg-amber-500/15 text-amber-400' :'bg-muted text-muted-foreground'
                  }`}
                >
                  {isActive ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <step.icon size={13} />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span
                    className={`text-xs font-medium transition-colors duration-200 ${
                      isComplete ? 'text-primary' : isActive ? 'text-amber-400' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                <AnimatePresence>
                  {isComplete && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CheckCircle2 size={13} className="text-primary flex-shrink-0" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Active query display */}
        {activeQuery && (
          <div className="flex flex-col gap-1.5 px-3 py-2.5 rounded-lg bg-muted/40 border border-border">
            <span className="text-xs font-medium text-muted-foreground">Active Query</span>
            <p className="text-xs text-foreground leading-relaxed line-clamp-3">{activeQuery}</p>
          </div>
        )}
      </div>
    </div>
  );
}