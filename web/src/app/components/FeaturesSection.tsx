'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  BarChart3,
  FileCheck,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    key: 'feat-research',
    icon: Brain,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    title: 'Autonomous Research',
    description:
      'Multi-agent AI orchestration explores web, academic papers, and proprietary datasets simultaneously. Surface what traditional search buries — in seconds, not days.',
    bullets: ['Multi-source crawling', 'Entity disambiguation', 'Cross-reference validation'],
  },
  {
    key: 'feat-confidence',
    icon: BarChart3,
    iconColor: 'text-accent',
    iconBg: 'bg-accent/10',
    title: 'Confidence Verification',
    description:
      'Every insight carries a precision confidence score derived from source credibility, corroboration density, and temporal freshness. No black box — full scoring breakdown available.',
    bullets: ['Source credibility weighting', 'Temporal decay modeling', 'Corroboration scoring'],
  },
  {
    key: 'feat-hcs',
    icon: FileCheck,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    title: 'Immutable HCS Publishing',
    description:
      'High-confidence findings are automatically submitted to Hedera Consensus Service. Each publication generates a permanent, cryptographically-verified transaction ID.',
    bullets: ['Auto-publish threshold: 85%+', 'Consensus timestamp proof', 'Tamper-evident audit trail'],
  },
  {
    key: 'feat-hol',
    icon: BookOpen,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    title: 'HOL Registry Discovery',
    description:
      'Cross-reference every entity against the Hedera Object Ledger. Instantly know if a company, person, or asset has an on-chain registry entry — and what it says.',
    bullets: ['Real-time registry lookup', 'Entity relationship mapping', 'Provenance chain tracing'],
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 lg:py-32">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 xl:px-16">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 mb-5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Platform Capabilities
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Intelligence that
            <span className="gradient-text"> can&apos;t be disputed</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Four layers of rigor between your question and a published, immutable answer.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5"
        >
          {features?.map((feature) => (
            <motion.div
              key={feature?.key}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              className="glass-card-hover rounded-2xl p-6 flex flex-col gap-5 cursor-default group"
            >
              {/* Icon */}
              <div className={`w-11 h-11 rounded-xl ${feature?.iconBg} flex items-center justify-center flex-shrink-0`}>
                <feature.icon size={20} className={feature?.iconColor} />
              </div>

              {/* Content */}
              <div className="flex flex-col gap-3 flex-1">
                <h3 className="text-base font-semibold text-foreground">{feature?.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature?.description}</p>
              </div>

              {/* Bullets */}
              <ul className="flex flex-col gap-2">
                {feature?.bullets?.map((bullet, i) => (
                  <li key={`${feature?.key}-bullet-${i}`} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>

              {/* Hover CTA */}
              <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Learn more
                <ArrowRight size={12} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}