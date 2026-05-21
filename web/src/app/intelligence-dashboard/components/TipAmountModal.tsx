'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  factTitle: string;
  onConfirm: (amount: number) => void;
  onClose: () => void;
}

const PRESETS = [0.5, 1, 2, 5];

export default function TipAmountModal({ isOpen, factTitle, onConfirm, onClose }: Props) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (val > 10000) {
      setError('Maximum tip is 10,000 HBAR.');
      return;
    }
    setError('');
    setAmount('');
    onConfirm(val);
  };

  const handleClose = () => {
    setAmount('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={handleClose}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-sm pointer-events-auto glass-card-hover rounded-2xl overflow-hidden shadow-2xl">
              <div className="h-0.5 w-full bg-gradient-to-r from-primary to-accent" />
              <div className="p-6 flex flex-col gap-5">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={14} />
                </button>

                <div className="flex flex-col gap-1">
                  <h2 className="text-base font-semibold text-foreground">Tip this fact</h2>
                  <p className="text-xs text-muted-foreground line-clamp-2">{factTitle}</p>
                </div>

                {/* Preset amounts */}
                <div className="flex gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => { setAmount(String(p)); setError(''); }}
                      className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all duration-150 ${
                        amount === String(p)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      {p} ℏ
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Custom amount (HBAR)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.01"
                      max="10000"
                      step="0.01"
                      value={amount}
                      onChange={(e) => { setAmount(e.target.value); setError(''); }}
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 pr-10 rounded-lg border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
                      style={{ colorScheme: 'dark' }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">ℏ</span>
                  </div>
                  {error && <p className="text-xs text-red-400">{error}</p>}
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={!amount}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap size={14} />
                  Send {amount ? `${amount} HBAR` : 'Tip'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
