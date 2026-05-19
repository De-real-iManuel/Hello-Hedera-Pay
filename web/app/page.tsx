'use client';

import { useState } from 'react';

interface Fact {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  sources: string[];
}

interface AnalyzeResponse {
  facts: Fact[];
}

export default function Home() {
  const [topic, setTopic] = useState('');
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFacts([]);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: AnalyzeResponse = await response.json();
      setFacts(data.facts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <section className="analyze-section">
        <h2>🔎 Analyze a Topic</h2>
        <form onSubmit={handleAnalyze}>
          <input
            type="text"
            placeholder="Enter a topic to research..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            minLength={8}
            maxLength={500}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>
        {error && <div className="error">{error}</div>}
      </section>

      {facts.length > 0 && (
        <section className="facts-section">
          <h2>📚 Discovered Facts</h2>
          <div className="facts-grid">
            {facts.map((fact) => (
              <div key={fact.id} className="fact-card">
                <h3>{fact.title}</h3>
                <p>{fact.summary}</p>
                <div className="fact-meta">
                  <span className="confidence">Confidence: {(fact.confidence * 100).toFixed(0)}%</span>
                  {fact.sources.length > 0 && (
                    <div className="sources">
                      <strong>Sources:</strong>
                      <ul>
                        {fact.sources.map((src) => (
                          <li key={src}>
                            <a href={src} target="_blank" rel="noopener noreferrer">
                              {new URL(src).hostname}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <button className="tip-btn">💰 Tip with HBAR</button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
