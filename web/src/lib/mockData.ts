import { IntelligenceResult } from '@/types/intelligence';

export const mockResults: IntelligenceResult[] = [
  {
    id: 'result-001',
    title: 'Hedera Treasury Reserve Composition — Undisclosed Allocation',
    content:
      'As of Q1 2026, the Hedera Governing Council holds approximately 31.2B HBAR in treasury reserves — a figure not prominently disclosed in standard investor materials. Reserve burn rate has accelerated 18% YoY driven by ecosystem grants totaling $47M in Q1 alone. The acceleration correlates with 14 new DApp partnerships announced in the same period, suggesting deliberate ecosystem expansion strategy.',
    confidence: 91,
    hcsStatus: 'published',
    hcsTopicId: '0.0.4821047',
    txId: '0.0.4821047@1747234512.009',
    timestamp: '2026-05-18T14:22:08Z',
    holStatus: 'registered',
    sources: ['Hedera Annual Report 2025', 'SEC Form 10-K Filing', 'CoinGecko Treasury API', 'Hedera Council Meeting Minutes'],
    category: 'Financial Intelligence',
  },
  {
    id: 'result-002',
    title: 'Council Voting Quorum Threshold — Silent Policy Change',
    content:
      'In March 2026, the Hedera Governing Council quietly amended its voting quorum threshold from 2/3 to 3/5 of active members — a change not reflected in the publicly accessible governance documentation as of May 2026. This reduces the threshold for passing critical protocol upgrades and was implemented via an internal council resolution rather than a public HIP process.',
    confidence: 84,
    hcsStatus: 'published',
    hcsTopicId: '0.0.4821051',
    txId: '0.0.4821051@1747234889.331',
    timestamp: '2026-05-18T14:41:29Z',
    holStatus: 'registered',
    sources: ['Hedera Council Internal Minutes (Leaked)', 'HIP Repository GitHub', 'Hedera Whitepaper v2.3'],
    category: 'Governance Intelligence',
  },
  {
    id: 'result-003',
    title: 'Node Operator Concentration — Centralization Risk',
    content:
      'Analysis of Hedera mainnet consensus node distribution reveals that 4 of 29 governing council members control nodes responsible for 61% of transaction throughput. This concentration exceeds the informal 33% threshold used in Byzantine fault tolerance models, creating a potential single-point-of-failure scenario not disclosed in official network documentation.',
    confidence: 77,
    hcsStatus: 'published',
    hcsTopicId: '0.0.4821060',
    txId: '0.0.4821060@1747235102.774',
    timestamp: '2026-05-18T15:05:02Z',
    holStatus: 'not-found',
    sources: ['Hedera Network Explorer Data', 'Node Performance Dashboard', 'Academic Paper: Hashgraph BFT Analysis (2025)'],
    category: 'Network Security',
  },
  {
    id: 'result-004',
    title: 'HBAR Vesting Schedule Acceleration — Institutional Impact',
    content:
      'Cross-referencing on-chain data with SEC filings reveals that three institutional holders exercised early HBAR vesting acceleration clauses in Q4 2025, releasing approximately 2.1B HBAR ahead of schedule. The market impact was partially masked by coordinated OTC desk activity, explaining the anomalous low-volatility period observed in November 2025.',
    confidence: 68,
    hcsStatus: 'pending',
    hcsTopicId: null,
    txId: null,
    timestamp: '2026-05-18T15:18:44Z',
    holStatus: 'not-found',
    sources: ['SEC EDGAR Filings', 'Hedera On-Chain Analytics', 'OTC Desk Reports (Redacted)'],
    category: 'Market Intelligence',
  },
  {
    id: 'result-005',
    title: 'Smart Contract Service Deprecation Timeline',
    content:
      'Internal engineering documentation suggests the Hedera Smart Contract Service (HSCS) EVM compatibility layer will undergo a breaking deprecation of legacy Solidity 0.8.x patterns in Q3 2026 — approximately 6 months earlier than the publicly communicated timeline. Approximately 340 deployed contracts may require migration.',
    confidence: 59,
    hcsStatus: 'failed',
    hcsTopicId: null,
    txId: null,
    timestamp: '2026-05-18T15:31:17Z',
    holStatus: 'not-found',
    sources: ['Hedera Engineering Blog (Internal Draft)', 'HSCS Migration Guide v1.2 (Draft)', 'Developer Forum Thread #8821'],
    category: 'Technical Intelligence',
  },
];