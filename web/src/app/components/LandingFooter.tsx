import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { ExternalLink, BookOpen, Mail } from 'lucide-react';

function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

const footerLinks = [
  {
    key: 'col-platform',
    heading: 'Platform',
    links: [
      { label: 'Launch App', href: '/intelligence-dashboard', key: 'fl-app' },
      { label: 'API Reference', href: '#', key: 'fl-api' },
      { label: 'Changelog', href: '#', key: 'fl-changelog' },
      { label: 'Status', href: '#', key: 'fl-status' },
    ],
  },
  {
    key: 'col-resources',
    heading: 'Resources',
    links: [
      { label: 'Documentation', href: '#', key: 'fl-docs' },
      { label: 'HCS Overview', href: '#', key: 'fl-hcs' },
      { label: 'HOL Registry', href: '#', key: 'fl-hol' },
      { label: 'Hedera Network', href: 'https://hedera.com', key: 'fl-hedera' },
    ],
  },
  {
    key: 'col-company',
    heading: 'Company',
    links: [
      { label: 'About', href: '#', key: 'fl-about' },
      { label: 'Blog', href: '#', key: 'fl-blog' },
      { label: 'Privacy Policy', href: '#', key: 'fl-privacy' },
      { label: 'Terms of Service', href: '#', key: 'fl-terms' },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 xl:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-2.5">
              <AppLogo size={28} />
              <span className="font-semibold text-sm text-foreground">
                Hello<span className="gradient-text">-Hedera-Pay</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover hidden intelligence. Verify it. Publish it immutably on Hedera.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/De-real-iManuel/Hello-Hedera-Pay"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200"
                aria-label="GitHub"
              >
                <GithubIcon size={14} />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200"
                aria-label="Documentation"
              >
                <BookOpen size={14} />
              </a>
              <a
                href="mailto:hello@hederaintel.io"
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200"
                aria-label="Contact"
              >
                <Mail size={14} />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {footerLinks?.map((col) => (
            <div key={col?.key} className="flex flex-col gap-4">
              <span className="text-xs font-semibold text-foreground uppercase tracking-widest">
                {col?.heading}
              </span>
              <ul className="flex flex-col gap-2.5">
                {col?.links?.map((link) => (
                  <li key={link?.key}>
                    <a
                      href={link?.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 flex items-center gap-1"
                    >
                      {link?.label}
                      {link?.href?.startsWith('http') && (
                        <ExternalLink size={10} className="opacity-50" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-border">
          <span className="text-xs text-muted-foreground">
            © 2026 Hello-Hedera-Pay. Built on Hedera Hashgraph.
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary network-pulse" />
            <span className="text-xs text-muted-foreground">
              Hedera Mainnet — All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}