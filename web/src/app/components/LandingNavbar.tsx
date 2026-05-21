'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { ExternalLink, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Features', href: '#features', key: 'nav-features' },
  { label: 'Demo', href: '#demo', key: 'nav-demo' },
  { label: 'Docs', href: '#docs', key: 'nav-docs' },
  { label: 'Pricing', href: '#pricing', key: 'nav-pricing' },
];

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/90 backdrop-blur-xl border-b border-border'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 xl:px-16">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <AppLogo size={32} />
              <span className="font-semibold text-base text-foreground tracking-tight">
                Hello<span className="gradient-text">-Hedera-Pay</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks?.map((link) => (
                <a key={link?.key} href={link?.href} className="nav-link">
                  {link?.label}
                </a>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <GithubIcon size={15} />
                GitHub
              </a>
              <Link
                href="/intelligence-dashboard"
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <ExternalLink size={14} />
                Launch App
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden text-muted-foreground hover:text-foreground transition-colors p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>
      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute top-0 right-0 h-full w-72 bg-card border-l border-border flex flex-col p-6 gap-6">
              <div className="flex items-center justify-between pt-2">
                <span className="font-semibold text-foreground">Navigation</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {navLinks?.map((link) => (
                  <a
                    key={link?.key}
                    href={link?.href}
                    className="nav-link text-base"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link?.label}
                  </a>
                ))}
              </div>
              <div className="flex flex-col gap-3 mt-auto">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <GithubIcon size={15} />
                  GitHub
                </a>
                <Link
                  href="/intelligence-dashboard"
                  className="btn-primary flex items-center justify-center gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <ExternalLink size={14} />
                  Launch App
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}