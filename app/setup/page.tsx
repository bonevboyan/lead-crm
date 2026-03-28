'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import { CITIES, CATEGORIES } from '@/lib/cities';

interface SearchLogEntry {
  id: string;
  city: string;
  category: string;
  results: number;
  createdAt: string;
}

const cityLabel = (id: string) =>
  CITIES[id as keyof typeof CITIES]?.name || id;

const categoryLabel = (value: string) =>
  CATEGORIES.find((c) => c.value === value)?.label || value.replace(/_/g, ' ');

export default function SetupPage() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [queued, setQueued] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0, found: 0 });
  const [previousSearch, setPreviousSearch] = useState<{ date: string; results: number } | null>(null);
  const [history, setHistory] = useState<SearchLogEntry[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [minReviews, setMinReviews] = useState('');
  const [maxReviews, setMaxReviews] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxRating, setMaxRating] = useState('');

  useEffect(() => {
    fetch('/api/places')
      .then((r) => r.json())
      .then((data) => setHistory(data.history || []))
      .catch(() => {});
  }, []);

  const checkPrevious = useCallback(async () => {
    if (!selectedCity || !selectedCategory) {
      setPreviousSearch(null);
      return;
    }
    try {
      const res = await fetch(`/api/places?city=${selectedCity}&category=${selectedCategory}`);
      const data = await res.json();
      if (data.searched) {
        setPreviousSearch({ date: data.date, results: data.results });
      } else {
        setPreviousSearch(null);
      }
    } catch {
      setPreviousSearch(null);
    }
  }, [selectedCity, selectedCategory]);

  useEffect(() => {
    checkPrevious();
  }, [checkPrevious]);

  async function handleSearch() {
    if (!selectedCity || !selectedCategory) {
      setError('Please select both city and category');
      return;
    }

    setError('');
    setLoading(true);
    setQueued(null);
    setProgress({ current: 0, total: 0, found: 0 });

    try {
      const response = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId: selectedCity,
          category: selectedCategory,
          filters: {
            minReviews: minReviews ? Number(minReviews) : undefined,
            maxReviews: maxReviews ? Number(maxReviews) : undefined,
            minRating: minRating ? Number(minRating) : undefined,
            maxRating: maxRating ? Number(maxRating) : undefined,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Search failed');
        setLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setError('Streaming not supported');
        setLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const match = line.match(/^data: (.+)$/m);
          if (!match) continue;

          const data = JSON.parse(match[1]);

          if (data.type === 'progress') {
            setProgress({ current: data.current, total: data.total, found: data.found });
          } else if (data.type === 'done') {
            setQueued(data.queued);
          } else if (data.type === 'error') {
            setError(data.error);
          }
        }
      }

      const histRes = await fetch('/api/places');
      const histData = await histRes.json();
      setHistory(histData.history || []);
      checkPrevious();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  const pct = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <>
      <Navigation />
      <main className="max-w-xl mx-auto px-4 sm:px-5 py-8 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            Search
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Find new leads by city and business category
          </p>
        </div>

        <div className="card p-4 sm:p-6 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-5">
            <div>
              <label className="label">City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="input-field"
                disabled={loading}
              >
                <option value="">Select city</option>
                {Object.entries(CITIES).map(([key, city]) => (
                  <option key={key} value={key}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
                disabled={loading}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 text-xs font-semibold mb-4"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{ transform: showFilters ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
            >
              <path d="M6 4l4 4-4 4" />
            </svg>
            Filters
            {(minReviews || maxReviews || minRating || maxRating) && (
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--accent)' }}
              />
            )}
          </button>

          {showFilters && (
            <div
              className="mb-5 p-4 rounded-xl grid grid-cols-2 gap-3"
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-light)' }}
            >
              <div>
                <label className="label">Min reviews</label>
                <input
                  type="number"
                  value={minReviews}
                  onChange={(e) => setMinReviews(e.target.value)}
                  placeholder="e.g. 5"
                  className="input-field"
                  min="0"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="label">Max reviews</label>
                <input
                  type="number"
                  value={maxReviews}
                  onChange={(e) => setMaxReviews(e.target.value)}
                  placeholder="e.g. 100"
                  className="input-field"
                  min="0"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="label">Min rating</label>
                <input
                  type="number"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  placeholder="e.g. 3.0"
                  className="input-field"
                  min="1"
                  max="5"
                  step="0.1"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="label">Max rating</label>
                <input
                  type="number"
                  value={maxRating}
                  onChange={(e) => setMaxRating(e.target.value)}
                  placeholder="e.g. 5.0"
                  className="input-field"
                  min="1"
                  max="5"
                  step="0.1"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {error && (
            <div
              className="mb-4 text-sm px-3.5 py-2.5 rounded-xl font-medium"
              style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}
            >
              {error}
            </div>
          )}

          {previousSearch && !loading && (
            <div
              className="mb-4 text-sm px-3.5 py-2.5 rounded-xl flex items-center gap-2"
              style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="shrink-0">
                <path d="M8 1.5 L14.5 13 H1.5 Z" strokeLinejoin="round" /><path d="M8 6v3" /><circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
              </svg>
              <span>
                Already searched on {new Date(previousSearch.date).toLocaleDateString()} ({previousSearch.results} results). Searching again will only add new businesses.
              </span>
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center gap-2.5">
                <span className="spinner" style={{ borderTopColor: 'var(--bg)' }} />
                <span>Searching...</span>
              </span>
            ) : (
              'Search'
            )}
          </button>

          {loading && progress.total > 0 && (
            <div className="mt-4">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-light)' }}>
                <div
                  className="h-full rounded-full transition-all duration-200 ease-out"
                  style={{ width: `${pct}%`, background: 'var(--accent)' }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Scanning area {progress.current} / {progress.total}
                </span>
                <span className="text-xs mono" style={{ color: 'var(--text-secondary)' }}>
                  {progress.found} found
                </span>
              </div>
            </div>
          )}
        </div>

        {queued !== null && (
          <div
            className="rounded-xl p-4 flex items-center justify-between mb-5"
            style={{
              background: queued > 0 ? 'var(--success-bg)' : 'var(--surface)',
              border: `1px solid ${queued > 0 ? 'var(--border)' : 'var(--border)'}`,
            }}
          >
            <span className="text-sm font-medium" style={{ color: queued > 0 ? 'var(--success)' : 'var(--text-secondary)' }}>
              {queued > 0 ? `${queued} new leads added to review queue` : 'No new businesses found'}
            </span>
            {queued > 0 && (
              <a
                href="/discover"
                className="text-sm font-semibold px-3 py-1 rounded-lg"
                style={{ color: 'var(--success)' }}
              >
                Start reviewing
              </a>
            )}
          </div>
        )}

        {history.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
              Search history
            </h2>
            <div className="card overflow-hidden overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>City</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Category</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Results</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr
                      key={entry.id}
                      className="cursor-pointer"
                      style={{ borderBottom: '1px solid var(--border-light)' }}
                      onClick={() => {
                        setSelectedCity(entry.city);
                        setSelectedCategory(entry.category);
                      }}
                    >
                      <td className="px-4 py-2.5" style={{ color: 'var(--text)' }}>{cityLabel(entry.city)}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--text)' }}>{categoryLabel(entry.category)}</td>
                      <td className="px-4 py-2.5 text-right mono" style={{ color: 'var(--text-secondary)' }}>{entry.results}</td>
                      <td className="px-4 py-2.5 text-right" style={{ color: 'var(--text-muted)' }}>
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
