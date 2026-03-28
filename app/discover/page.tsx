'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { checkWeakWebsite } from '@/lib/cities';

interface Business {
  id: string;
  placeId: string;
  name: string;
  category: string;
  phone: string | null;
  website: string | null;
  mapsUrl: string;
  reviewCount: number;
  rating: number | null;
  isWeakWebsite: boolean;
}

export default function DiscoverPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/businesses?queue=true')
      .then((r) => r.json())
      .then((data) => setBusinesses(data.businesses || []))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  async function handleRejectAll() {
    const remaining = businesses.length - currentIndex;
    if (!confirm(`Reject all ${remaining} remaining businesses?`)) return;

    setLoading(true);
    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject-all' }),
      });

      if (response.ok) {
        setBusinesses([]);
        setCurrentIndex(0);
      }
    } catch {
      setError('Network error');
      setTimeout(() => setError(''), 2000);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action: 'approve' | 'reject') {
    if (currentIndex >= businesses.length) return;

    const business = businesses[currentIndex];
    setLoading(true);

    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          placeId: business.placeId,
          business,
        }),
      });

      if (response.ok) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setError('Error');
        setTimeout(() => setError(''), 2000);
      }
    } catch {
      setError('Network error');
      setTimeout(() => setError(''), 2000);
    } finally {
      setLoading(false);
    }
  }

  const currentBusiness = businesses[currentIndex];

  if (fetching) {
    return (
      <>
        <Navigation />
        <main className="max-w-xl mx-auto px-5 py-10">
          <div className="flex items-center justify-center h-80">
            <div className="spinner" style={{ color: 'var(--accent)' }} />
          </div>
        </main>
      </>
    );
  }

  if (businesses.length === 0) {
    return (
      <>
        <Navigation />
        <main className="max-w-xl mx-auto px-5 py-10">
          <div className="text-center py-20">
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'var(--border-light)' }}
            >
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)' }}>
                <path d="M2 5l6-3 6 3-6 3-6-3z" strokeLinejoin="round" />
                <path d="M2 8l6 3 6-3" />
                <path d="M2 11l6 3 6-3" />
              </svg>
            </div>
            <p className="font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Queue is empty</p>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Run a search to discover new leads</p>
            <a href="/setup" className="btn-primary inline-block">Go to Search</a>
          </div>
        </main>
      </>
    );
  }

  if (currentIndex >= businesses.length) {
    return (
      <>
        <Navigation />
        <main className="max-w-xl mx-auto px-5 py-10">
          <div className="text-center py-20">
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'var(--success-bg)' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--success)' }}>
                <polyline points="4 10 8 14 16 6" />
              </svg>
            </div>
            <p className="font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>All caught up</p>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>You&apos;ve reviewed everything in the queue</p>
            <a href="/setup" className="btn-primary inline-block">Search for more</a>
          </div>
        </main>
      </>
    );
  }

  const { flags } = checkWeakWebsite(currentBusiness.website);
  const progress = ((currentIndex) / businesses.length) * 100;

  return (
    <>
      <Navigation />
      <main className="max-w-xl mx-auto px-4 sm:px-5 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="mono text-sm" style={{ color: 'var(--text-muted)' }}>
              {currentIndex + 1}
              <span style={{ color: 'var(--border)' }}> / </span>
              {businesses.length}
            </span>
            {error && (
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}
              >
                {error}
              </span>
            )}
          </div>
          <button
            onClick={handleRejectAll}
            disabled={loading}
            className="text-xs font-semibold disabled:opacity-50"
            style={{ color: 'var(--danger)' }}
          >
            Reject all remaining
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full mb-5 overflow-hidden" style={{ background: 'var(--border-light)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: 'var(--accent)' }}
          />
        </div>

        {/* Card */}
        <div className="card overflow-hidden">
          <div className="p-4 sm:p-6 h-[280px] sm:h-[320px] overflow-y-auto">
            <h2 className="text-xl font-bold tracking-tight mb-5" style={{ color: 'var(--text)' }}>
              {currentBusiness.name}
            </h2>

            <div className="space-y-3">
              <DetailRow label="Category">
                <span className="capitalize">{currentBusiness.category.replace(/_/g, ' ')}</span>
              </DetailRow>

              <DetailRow label="Reviews">
                <span className="mono">{currentBusiness.reviewCount}</span>
              </DetailRow>

              {currentBusiness.rating && (
                <DetailRow label="Rating">
                  <span className="mono">{currentBusiness.rating.toFixed(1)}</span>
                  <span style={{ color: 'var(--text-muted)' }}> / 5</span>
                </DetailRow>
              )}

              {currentBusiness.phone && (
                <DetailRow label="Phone">
                  <a href={`tel:${currentBusiness.phone}`} style={{ color: 'var(--accent)' }}>
                    {currentBusiness.phone}
                  </a>
                </DetailRow>
              )}

              {currentBusiness.website && (
                <DetailRow label="Website">
                  <a
                    href={currentBusiness.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate block"
                    style={{ color: 'var(--accent)' }}
                  >
                    {currentBusiness.website.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </DetailRow>
              )}

              <DetailRow label="Maps">
                <a
                  href={currentBusiness.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)' }}
                >
                  View on Google Maps
                </a>
              </DetailRow>
            </div>

            {/* Signals */}
            {(currentBusiness.isWeakWebsite || !currentBusiness.website) && (
              <div className="mt-5 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl" style={{ background: 'var(--accent-light)' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: 'var(--accent)', flexShrink: 0 }}>
                  {!currentBusiness.website ? (
                    <><circle cx="8" cy="8" r="6.5" /><path d="M8 5v3" /><circle cx="8" cy="11" r="0.5" fill="currentColor" /></>
                  ) : (
                    <><path d="M8 1.5 L14.5 13 H1.5 Z" strokeLinejoin="round" /><path d="M8 6v3" /><circle cx="8" cy="11.5" r="0.5" fill="currentColor" /></>
                  )}
                </svg>
                <div className="text-sm" style={{ color: 'var(--accent-hover)' }}>
                  {!currentBusiness.website ? (
                    <span className="font-semibold">No website — strong lead</span>
                  ) : (
                    <>
                      <span className="font-semibold">Weak website</span>
                      <span style={{ color: 'var(--text-muted)' }}> — {flags.join(', ')}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-4 sm:px-6 py-4" style={{ borderTop: '1px solid var(--border-light)', background: 'var(--surface-hover)' }}>
            <div className="flex gap-3">
              <button
                onClick={() => handleAction('reject')}
                disabled={loading}
                className="btn-secondary flex-1 flex items-center justify-center"
              >
                {loading ? <span className="spinner" style={{ borderTopColor: 'var(--text-muted)' }} /> : 'Skip'}
              </button>
              <button
                onClick={() => handleAction('approve')}
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center"
              >
                {loading ? <span className="spinner" style={{ borderTopColor: 'var(--bg)' }} /> : 'Save to CRM'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 text-sm">
      <span
        className="w-20 shrink-0 text-xs font-semibold uppercase"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}
      >
        {label}
      </span>
      <span style={{ color: 'var(--text)' }}>{children}</span>
    </div>
  );
}
