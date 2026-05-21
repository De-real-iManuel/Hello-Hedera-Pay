'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Hexagon, Shield, Zap } from 'lucide-react';

const floatingBadges = [
  { icon: Shield, label: 'HCS Verified', color: 'text-primary', key: 'badge-hcs' },
  { icon: Zap, label: '94.7% Confidence', color: 'text-accent', key: 'badge-conf' },
  { icon: Hexagon, label: 'HOL Registered', color: 'text-blue-400', key: 'badge-hol' },
];

const stats = [
  { value: '2.4M+', label: 'Facts Published', key: 'stat-facts' },
  { value: '99.3%', label: 'Uptime', key: 'stat-uptime' },
  { value: '<3s', label: 'Consensus Time', key: 'stat-consensus' },
  { value: '140+', label: 'Enterprise Clients', key: 'stat-clients' },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      {/* Hero gradient overlay */}
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 orb-primary animate-float-slow pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 orb-accent animate-float-medium pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 orb-blue animate-float-slow pointer-events-none" style={{ animationDelay: '4s' }} />
      <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-10 xl:px-16 text-center">
        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/8 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary network-pulse" />
          <span className="text-xs font-medium text-primary tracking-wide uppercase">
            Powered by Hedera Consensus Service
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-tight mb-6"
        >
          Discover hidden
          <br />
          <span className="gradient-text glow-text">intelligence.</span>
          <br />
          Publish it forever.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Autonomous AI agents surface insights your competitors miss. Every finding is
          confidence-scored, source-verified, and published immutably to the Hedera
          Consensus Service — creating a tamper-proof audit trail.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            href="/intelligence-dashboard"
            className="btn-primary flex items-center gap-2 text-base px-6 py-3 rounded-lg"
          >
            Start Digging
            <ArrowRight size={16} />
          </Link>
          <button className="btn-secondary flex items-center gap-2 text-base px-6 py-3 rounded-lg">
            <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center">
              <Play size={10} className="text-foreground ml-0.5" fill="currentColor" />
            </div>
            View Demo
          </button>
        </motion.div>

        {/* Floating Status Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-16"
        >
          {floatingBadges?.map((badge, i) => (
            <motion.div
              key={badge?.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
              className="glass-card flex items-center gap-2 px-4 py-2 rounded-full"
            >
              <badge.icon size={14} className={badge?.color} />
              <span className="text-sm font-medium text-foreground">{badge?.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {stats?.map((stat, i) => (
            <motion.div
              key={stat?.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1 + i * 0.08 }}
              className="flex flex-col items-center"
            >
              <span className="text-2xl md:text-3xl font-bold gradient-text font-mono-data">
                {stat?.value}
              </span>
              <span className="text-xs text-muted-foreground mt-1">{stat?.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}