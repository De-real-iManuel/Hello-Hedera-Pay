import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hello Hedera Pay',
  description: 'AI-powered fact discovery with HBAR tipping via Hedera HCS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <h1>🔍 Hello Hedera Pay</h1>
            <p>Discover hidden facts. Tip with HBAR.</p>
          </header>
          <main className="main">
            {children}
          </main>
          <footer className="footer">
            <p>&copy; 2026 Hello Hedera Pay. Powered by Hedera Agent Kit.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
