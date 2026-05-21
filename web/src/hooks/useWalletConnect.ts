'use client';

import { useCallback, useRef, useState } from 'react';
import {
  DAppConnector,
  HederaJsonRpcMethod,
  HederaSessionEvent,
  HederaChainId,
  transactionToBase64String,
} from '@hashgraph/hedera-wallet-connect';
import { AccountId, Hbar, LedgerId, TransferTransaction } from '@hiero-ledger/sdk';

export interface UseWalletConnectReturn {
  isConnected: boolean;
  accountId: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendHbar: (params: { recipientAccountId: string; amount: number }) => Promise<string>;
}

const PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'hello-hedera-pay-dev';

const APP_METADATA = {
  name: 'Hello Hedera Pay',
  description: 'Truth Tip Agent — tip AI-researched facts on-chain',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://hello-hedera-pay.vercel.app',
  icons: ['https://hello-hedera-pay.vercel.app/favicon.ico'],
};

function resolveLedgerId(network: string | undefined): LedgerId {
  if (network === 'mainnet') return LedgerId.MAINNET;
  return LedgerId.TESTNET;
}

export function useWalletConnect(): UseWalletConnectReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const tipInFlightRef = useRef(false);
  const connectorRef = useRef<DAppConnector | null>(null);

  const getConnector = useCallback((): DAppConnector => {
    if (connectorRef.current) return connectorRef.current;
    const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK;
    const ledgerId = resolveLedgerId(network);
    const connector = new DAppConnector(
      APP_METADATA,
      ledgerId,
      PROJECT_ID,
      Object.values(HederaJsonRpcMethod),
      [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
      [network === 'mainnet' ? HederaChainId.Mainnet : HederaChainId.Testnet],
    );
    connectorRef.current = connector;
    return connector;
  }, []);

  const connect = useCallback(async (): Promise<void> => {
    const connector = getConnector();
    try {
      await connector.init();
      const session = await connector.openModal();
      const accounts = Object.values(session.namespaces).flatMap((ns) => ns.accounts);
      if (accounts.length === 0) throw new Error('No accounts found in WalletConnect session.');
      const parts = accounts[0].split(':');
      setAccountId(parts[parts.length - 1]);
      setIsConnected(true);
    } catch (err: unknown) {
      connectorRef.current = null;
      throw new Error(err instanceof Error ? err.message : 'WalletConnect pairing failed.');
    }
  }, [getConnector]);

  const disconnect = useCallback(async (): Promise<void> => {
    if (tipInFlightRef.current) {
      const deadline = Date.now() + 60_000;
      await new Promise<void>((resolve) => {
        const poll = setInterval(() => {
          if (!tipInFlightRef.current || Date.now() >= deadline) {
            clearInterval(poll);
            resolve();
          }
        }, 200);
      });
    }
    const connector = connectorRef.current;
    if (connector) {
      try { await connector.disconnectAll(); } catch { /* ignore */ }
      connectorRef.current = null;
    }
    setIsConnected(false);
    setAccountId(null);
  }, []);

  const sendHbar = useCallback(
    async ({ recipientAccountId, amount }: { recipientAccountId: string; amount: number }): Promise<string> => {
      if (!isConnected || !accountId) throw new Error('Wallet is not connected.');
      const connector = connectorRef.current;
      if (!connector) throw new Error('DAppConnector is not initialised.');
      tipInFlightRef.current = true;
      try {
        const senderAccountId = AccountId.fromString(accountId);
        const recipientId = AccountId.fromString(recipientAccountId);
        const hbarAmount = new Hbar(amount);
        const transaction = new TransferTransaction()
          .addHbarTransfer(senderAccountId, hbarAmount.negated())
          .addHbarTransfer(recipientId, hbarAmount);
        const transactionBase64 = transactionToBase64String(transaction);
        const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK ?? 'testnet';
        const result = await connector.signAndExecuteTransaction({
          signerAccountId: `hedera:${network}:${accountId}`,
          transactionList: transactionBase64,
        });
        const txId: string = result.result.transactionId;
        if (!txId) throw new Error('Transaction completed but no transaction ID was returned.');
        return txId;
      } finally {
        tipInFlightRef.current = false;
      }
    },
    [isConnected, accountId],
  );

  return { isConnected, accountId, connect, disconnect, sendHbar };
}

export default useWalletConnect;
