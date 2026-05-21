'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import QueryPanel from './QueryPanel';
import ResultsPanel from './ResultsPanel';
import { IntelligenceResult, TipResponse, TipStatus, HCSStatus, HOLStatus } from '@/types/intelligence';
import { useWalletConnect } from '@/hooks/useWalletConnect';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardShell } from '../DashboardShellContext';

const TipSuccessModal = dynamic(() => import('./TipSuccessModal'), { ssr: false });

// ---------------------------------------------------------------------------
// Backend Fact shape (as returned by POST /analyze)
// ---------------------------------------------------------------------------
interface BackendFact {
  id: string;
  title: string;
  summary: string;
  confidence: number; // 0.0–1.0
  sources: string[];
}

interface ActiveTipResult extends TipResponse {
  factId: string;
}

function mapFactsToResults(facts: BackendFact[], topic: string): IntelligenceResult[] {
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

// ---------------------------------------------------------------------------
// Authenticated fetch helper — attaches Bearer token when available
// ---------------------------------------------------------------------------
async function apiFetch(
  url: string,
  options: RequestInit,
  accessToken: string | null
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return fetch(url, { ...options, headers });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function DashboardLayout() {
  const [results, setResults] = useState<IntelligenceResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeQuery, setActiveQuery] = useState('');
  const [tipStatus, setTipStatus] = useState<Record<string, TipStatus>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTipResult, setActiveTipResult] = useState<ActiveTipResult | null>(null);

  const { sendHbar, isConnected } = useWalletConnect();
  const { accessToken } = useAuth();
  const { addRecentQuery } = useDashboardShell();

  const API = process.env.NEXT_PUBLIC_API_URL;

  // -------------------------------------------------------------------------
  // handleAnalyze — public endpoint, no auth required
  // -------------------------------------------------------------------------
  const handleAnalyze = async (topic: string) => {
    setIsAnalyzing(true);
    setActiveQuery(topic);
    setResults([]);
    try {
      const res = await apiFetch(
        `${API}/analyze`,
        { method: 'POST', body: JSON.stringify({ topic }) },
        accessToken
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error((err as { detail?: string }).detail ?? 'Analysis failed. Please try again.');
        return;
      }
      const data = await res.json();
      const mapped = mapFactsToResults(data.facts, topic);
      setResults(mapped);
      addRecentQuery({
        id: `rq-${Date.now()}`,
        query: topic,
        time: 'Just now',
        results: mapped.length,
      });
    } catch {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // -------------------------------------------------------------------------
  // handleTip — requires wallet + auth token
  // -------------------------------------------------------------------------
  const handleTip = async (factId: string) => {
    if (!isConnected) {
      toast.info('Please connect your HashPack wallet before tipping.');
      return;
    }
    if (!accessToken) {
      toast.info('Please sign in before tipping.');
      return;
    }

    setTipStatus((prev) => ({ ...prev, [factId]: 'pending-wallet' }));

    try {
      // Step 1: wallet signs & sends the HBAR transfer
      const txId = await sendHbar({
        recipientAccountId: process.env.NEXT_PUBLIC_TIP_RECIPIENT_ACCOUNT_ID!,
        amount: parseFloat(process.env.NEXT_PUBLIC_TIP_AMOUNT_HBAR!),
      });

      // Wallet confirmed — show success immediately
      setTipStatus((prev) => ({ ...prev, [factId]: 'success' }));
      toast.success('Tip sent! Transaction confirmed on Hedera.');

      const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK ?? 'testnet';
      const hashscanUrl = `https://hashscan.io/${network}/transaction/${txId}`;
      const hcsUrl = `https://hashscan.io/${network}/topic/${process.env.NEXT_PUBLIC_TIP_RECIPIENT_ACCOUNT_ID}`;

      // Step 2: notify backend with auth token (best-effort)
      setTipStatus((prev) => ({ ...prev, [factId]: 'pending-api' }));
      try {
        const res = await apiFetch(
          `${API}/tip`,
          {
            method: 'POST',
            body: JSON.stringify({
              fact_id: factId,
              amount: parseFloat(process.env.NEXT_PUBLIC_TIP_AMOUNT_HBAR!),
              transaction_id: txId,
              topic: activeQuery,
            }),
          },
          accessToken
        );
        if (res.ok) {
          const tipData: TipResponse = await res.json();
          setActiveTipResult({ factId, ...tipData });
        } else {
          setActiveTipResult({
            factId,
            transaction_id: txId,
            hashscan_url: hashscanUrl,
            hcs_message_id: 'pending',
            hcs_url: hcsUrl,
          });
        }
      } catch {
        setActiveTipResult({
          factId,
          transaction_id: txId,
          hashscan_url: hashscanUrl,
          hcs_message_id: 'pending',
          hcs_url: hcsUrl,
        });
      }

      setModalOpen(true);
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

  const activeFact = activeTipResult
    ? results.find((r) => r.id === activeTipResult.factId)
    : null;

  return (
    <>
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Left panel */}
        <div className="w-80 xl:w-96 flex-shrink-0 border-r border-border overflow-y-auto scrollbar-thin">
          <QueryPanel
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            activeQuery={activeQuery}
          />
        </div>
        {/* Right panel */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <ResultsPanel
            results={results}
            isAnalyzing={isAnalyzing}
            activeQuery={activeQuery}
            tipStatus={tipStatus}
            onTip={handleTip}
          />
        </div>
      </div>

      <TipSuccessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        factTitle={activeFact?.title ?? ''}
        amountHbar={parseFloat(process.env.NEXT_PUBLIC_TIP_AMOUNT_HBAR ?? '0.5')}
        hashscanUrl={activeTipResult?.hashscan_url ?? ''}
        hcsUrl={activeTipResult?.hcs_url ?? ''}
      />
    </>
  );
}
