'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
const QueryPanel = dynamic(() => import('./QueryPanel'), {
  ssr: false,
  loading: () => <div className="flex flex-col h-full p-5 gap-6 animate-pulse"><div className="h-8 w-3/4 rounded bg-muted" /><div className="h-32 w-full rounded-lg bg-muted" /><div className="h-10 w-full rounded-lg bg-muted" /></div>,
});
const ResultsPanel = dynamic(() => import('./ResultsPanel'), {
  ssr: false,
  loading: () => <div className="flex flex-col h-full p-5 gap-5 animate-pulse"><div className="grid grid-cols-2 gap-4"><div className="h-24 rounded-xl bg-muted" /><div className="h-24 rounded-xl bg-muted" /></div><div className="h-48 rounded-2xl bg-muted" /><div className="h-48 rounded-2xl bg-muted" /></div>,
});
import { IntelligenceResult, TipResponse, TipStatus, HCSStatus, HOLStatus } from '@/types/intelligence';
import { useDashboardShell } from '../DashboardShellContext';
import { useAuth } from '@/contexts/AuthContext';

const TipSuccessModal = dynamic(() => import('./TipSuccessModal'), { ssr: false });
const TipAmountModal = dynamic(() => import('./TipAmountModal'), { ssr: false });

interface Fact {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  sources: string[];
}

interface HistoryFact extends Fact {
  category: string;
  created_at: string;
}

interface ActiveTipResult extends TipResponse {
  factId: string;
  amountHbar: number;
}

function mapFactsToResults(facts: Fact[], topic: string): IntelligenceResult[] {
  return facts.map((f) => ({
    id: f.id,
    title: f.title,
    content: f.summary,
    confidence: Math.round(f.confidence * 100),
    hcsStatus: 'pending' as HCSStatus,
    hcsTopicId: null,
    txId: null,
    timestamp: new Date().toISOString(),
    holStatus: 'not-found' as HOLStatus,
    sources: f.sources,
    category: topic,
  }));
}

function mapHistoryFactsToResults(facts: HistoryFact[]): IntelligenceResult[] {
  return facts.map((f) => ({
    id: f.id,
    title: f.title,
    content: f.summary,
    confidence: Math.round(f.confidence * 100),
    hcsStatus: 'pending' as HCSStatus,
    hcsTopicId: null,
    txId: null,
    timestamp: f.created_at,
    holStatus: 'not-found' as HOLStatus,
    sources: f.sources,
    category: f.category,
  }));
}

export default function DashboardLayout() {
  const [results, setResults] = useState<IntelligenceResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeQuery, setActiveQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'analyze' | 'results'>('analyze');

  const [tipStatus, setTipStatus] = useState<Record<string, TipStatus>>({});
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [activeTipResult, setActiveTipResult] = useState<ActiveTipResult | null>(null);

  // Tip amount modal state
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [pendingTipFactId, setPendingTipFactId] = useState<string | null>(null);

  const { wallet, addRecentQuery, setOnSelectQuery } = useDashboardShell();
  const { sendHbar, isConnected } = wallet;
  const { accessToken } = useAuth();

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };

  // -------------------------------------------------------------------------
  // handleSelectQuery — restore a past research session
  // -------------------------------------------------------------------------
  const handleSelectQuery = useCallback(async (query: string) => {
    setIsAnalyzing(true);
    setActiveQuery(query);
    setResults([]);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history/queries?limit=50`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error();
      const data: { topic: string; facts: HistoryFact[] }[] = await res.json();
      const match = data.find((q) => q.topic === query);
      if (match && match.facts.length > 0) {
        setResults(mapHistoryFactsToResults(match.facts));
        setIsAnalyzing(false);
        setActiveTab('results');
        return;
      }
    } catch { /* fall through to fresh analysis */ }
    await handleAnalyze(query);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  React.useEffect(() => {
    setOnSelectQuery(() => handleSelectQuery);
  }, [handleSelectQuery, setOnSelectQuery]);

  // -------------------------------------------------------------------------
  // handleAnalyze
  // -------------------------------------------------------------------------
  const handleAnalyze = async (topic: string) => {
    setIsAnalyzing(true);
    setActiveQuery(topic);
    setResults([]);
    setActiveTab('results');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analyze`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ topic }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error((err as { message?: string }).message ?? 'Analysis failed. Please try again.');
        return;
      }
      const data = await res.json();
      const mapped = mapFactsToResults(data.facts, topic);
      setResults(mapped);
      addRecentQuery({ id: `rq-${Date.now()}`, query: topic, time: 'Just now', results: mapped.length });
    } catch {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // -------------------------------------------------------------------------
  // handleTip — opens amount modal first
  // -------------------------------------------------------------------------
  const handleTip = (factId: string) => {
    if (!isConnected) {
      toast.info('Please connect your HashPack wallet before tipping.');
      return;
    }
    setPendingTipFactId(factId);
    setTipModalOpen(true);
  };

  // -------------------------------------------------------------------------
  // handleTipConfirm — called after user enters amount
  // -------------------------------------------------------------------------
  const handleTipConfirm = async (amount: number) => {
    const factId = pendingTipFactId;
    if (!factId) return;
    setTipModalOpen(false);
    setPendingTipFactId(null);
    setTipStatus((prev) => ({ ...prev, [factId]: 'pending-wallet' }));

    try {
      const txId = await sendHbar({
        recipientAccountId: process.env.NEXT_PUBLIC_TIP_RECIPIENT_ACCOUNT_ID!,
        amount,
      });

      setTipStatus((prev) => ({ ...prev, [factId]: 'success' }));
      toast.success('Tip sent! Transaction confirmed on Hedera.');

      const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK ?? 'testnet';
      const hashscanUrl = `https://hashscan.io/${network}/transaction/${txId}`;
      const hcsUrl = `https://hashscan.io/${network}/topic/${process.env.NEXT_PUBLIC_HCS_TOPIC_ID}`;

      setTipStatus((prev) => ({ ...prev, [factId]: 'pending-api' }));
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tip`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ fact_id: factId, amount, transaction_id: txId, topic: activeQuery }),
        });
        if (res.ok) {
          const tipData: TipResponse = await res.json();
          setActiveTipResult({ factId, amountHbar: amount, ...tipData });
        } else {
          setActiveTipResult({ factId, amountHbar: amount, transaction_id: txId, hashscan_url: hashscanUrl, hcs_message_id: 'pending', hcs_url: hcsUrl });
        }
      } catch {
        setActiveTipResult({ factId, amountHbar: amount, transaction_id: txId, hashscan_url: hashscanUrl, hcs_message_id: 'pending', hcs_url: hcsUrl });
      }

      setSuccessModalOpen(true);
      setTipStatus((prev) => ({ ...prev, [factId]: 'success' }));
      setTimeout(() => setTipStatus((prev) => ({ ...prev, [factId]: 'idle' })), 3000);

    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('reject')) {
        toast.info('Tip cancelled.');
      } else {
        toast.error(`Transaction failed: ${msg}`);
      }
      setTipStatus((prev) => ({ ...prev, [factId]: 'idle' }));
    }
  };

  const activeFact = activeTipResult ? results.find((r) => r.id === activeTipResult.factId) : null;
  const tipAmountFact = pendingTipFactId ? results.find((r) => r.id === pendingTipFactId) : null;

  return (
    <>
      <div className="flex flex-col lg:flex-row flex-1 h-full overflow-hidden">
        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden border-b border-border bg-card p-2 gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab('analyze')}
            className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'analyze'
                ? 'bg-primary/10 text-primary border border-primary/25'
                : 'text-muted-foreground hover:bg-muted/40'
            }`}
          >
            1. Analyze Topic
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'results'
                ? 'bg-primary/10 text-primary border border-primary/25'
                : 'text-muted-foreground hover:bg-muted/40'
            }`}
          >
            2. Insights Panel
            {results.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-[10px] text-primary font-mono-data">
                {results.length}
              </span>
            )}
          </button>
        </div>

        {/* Query/Search Panel */}
        <div className={`w-full lg:w-80 lg:block xl:w-96 flex-shrink-0 border-r border-border overflow-y-auto scrollbar-thin ${
          activeTab === 'analyze' ? 'block' : 'hidden'
        }`}>
          <QueryPanel onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} activeQuery={activeQuery} />
        </div>

        {/* Results/Insights List */}
        <div className={`flex-1 overflow-y-auto lg:block scrollbar-thin ${
          activeTab === 'results' ? 'block' : 'hidden'
        }`}>
          <ResultsPanel
            results={results}
            isAnalyzing={isAnalyzing}
            activeQuery={activeQuery}
            tipStatus={tipStatus}
            onTip={handleTip}
          />
        </div>
      </div>

      <TipAmountModal
        isOpen={tipModalOpen}
        factTitle={tipAmountFact?.title ?? ''}
        onConfirm={handleTipConfirm}
        onClose={() => { setTipModalOpen(false); setPendingTipFactId(null); }}
      />

      <TipSuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        factTitle={activeFact?.title ?? ''}
        amountHbar={activeTipResult?.amountHbar ?? 0}
        hashscanUrl={activeTipResult?.hashscan_url ?? ''}
        hcsUrl={activeTipResult?.hcs_url ?? ''}
      />
    </>
  );
}
