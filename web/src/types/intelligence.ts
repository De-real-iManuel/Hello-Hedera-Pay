export type HCSStatus = 'published' | 'pending' | 'failed';
export type HOLStatus = 'registered' | 'not-found';

export interface IntelligenceResult {
  id: string;
  title: string;
  content: string;
  confidence: number;
  hcsStatus: HCSStatus;
  hcsTopicId: string | null;
  txId: string | null;
  timestamp: string;
  holStatus: HOLStatus;
  sources: string[];
  category: string;
}

export interface TipRequest {
  fact_id: string;
  amount: number;
  transaction_id: string;
  topic: string;
}

export interface TipResponse {
  transaction_id: string;
  hashscan_url: string;
  hcs_message_id: string;
  hcs_url: string;
}

export type TipStatus = 'idle' | 'pending-wallet' | 'pending-api' | 'success' | 'error';
