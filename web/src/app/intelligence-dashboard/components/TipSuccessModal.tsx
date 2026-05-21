'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ExternalLink, X } from 'lucide-react';

interface TipSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  factTitle: string;
  amountHbar: number;
  hashscanUrl: string;
  hcsUrl: string;
}

export default function TipSuccessModal({
  isOpen,
  onClose,
  factTitle,
  amountHbar,
  hashscanUrl,
  hcsUrl,
}: TipSuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tip-success-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-md pointer-events-auto glass-card-hover rounded-2xl overflow-hidden shadow-2xl">
              <div className="h-0.5 w-full bg-gradient-to-r from-primary to-accent" />

              <div className="p-6 flex flex-col gap-5">
                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200"
                  aria-label="Close modal"
                >
                  <X size={14} />
                </button>

                {/* Icon + heading */}
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <CheckCircle2 size={24} className="text-primary" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 id="tip-success-title" className="text-base font-semibold text-foreground">
                      Tip Sent Successfully
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Your tip has been recorded on the Hedera network.
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Fact Tipped
                    </span>
                    <span className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                      {factTitle}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Amount
                    </span>
                    <span className="text-sm font-bold font-mono-data text-primary">
                      {amountHbar} HBAR
                    </span>
                  </div>
                </div>

                {/* Links */}
                <div className="flex flex-col gap-2">
                  <a
                    href={hashscanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40 transition-all duration-200 group"
                  >
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      View Transaction on HashScan
                    </span>
                    <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </a>
                  <a
                    href={hcsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40 transition-all duration-200 group"
                  >
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      View HCS Record on HashScan
                    </span>
                    <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </a>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
