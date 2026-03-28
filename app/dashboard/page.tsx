'use client';

import { useState, useEffect, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import { CATEGORIES } from '@/lib/cities';

interface Business {
  id: string;
  placeId: string;
  name: string;
  city: string | null;
  category: string;
  phone: string | null;
  website: string | null;
  mapsUrl: string;
  reviewCount: number;
  rating: number | null;
  isWeakWebsite: boolean;
  createdAt: string;
  crmStatus: {
    id: string;
    status: string;
    notes: string | null;
  } | null;
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', bg: 'var(--surface)', color: 'var(--text-muted)', border: 'var(--border)' },
  { value: 'CALLED', label: 'Called', bg: 'var(--info-bg)', color: 'var(--info)', border: '#C5D8E8' },
  { value: 'INTERESTED', label: 'Interested', bg: 'var(--success-bg)', color: 'var(--success)', border: '#C1D9C8' },
  { value: 'CALLBACK', label: 'Callback', bg: 'var(--warning-bg)', color: 'var(--warning)', border: '#E8DFC0' },
  { value: 'NOT_INTERESTED', label: 'Not interested', bg: 'var(--danger-bg)', color: 'var(--danger)', border: '#E8C5C0' },
];

function getStatusStyle(status: string) {
  return STATUS_OPTIONS.find((opt) => opt.value === status) || STATUS_OPTIONS[0];
}

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [websiteFilter, setWebsiteFilter] = useState('ALL');
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [showTrash, setShowTrash] = useState(false);
  const [trashedBusinesses, setTrashedBusinesses] = useState<Business[]>([]);
  const [loadingTrash, setLoadingTrash] = useState(false);

  function toggleNotes(id: string) {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (showTrash) fetchTrashed();
  }, [showTrash]);

  async function fetchTrashed() {
    setLoadingTrash(true);
    try {
      const response = await fetch('/api/businesses?rejected=true');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setTrashedBusinesses(data.businesses);
    } catch {
      setError('Failed to load trashed leads');
    } finally {
      setLoadingTrash(false);
    }
  }

  async function restoreBusiness(businessId: string) {
    try {
      const response = await fetch(`/api/businesses/${businessId}/restore`, {
        method: 'POST',
      });
      if (response.ok) {
        const restored = trashedBusinesses.find((b) => b.id === businessId);
        setTrashedBusinesses((prev) => prev.filter((b) => b.id !== businessId));
        if (restored) {
          setBusinesses((prev) => [{ ...restored, isRejected: false, crmStatus: { id: '', status: 'PENDING', notes: null } } as Business, ...prev]);
        }
      }
    } catch {
      alert('Failed to restore');
    }
  }

  async function permanentDelete(businessId: string) {
    if (!confirm('Permanently delete this lead? This cannot be undone.')) return;
    try {
      const response = await fetch(`/api/businesses/${businessId}/destroy`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTrashedBusinesses((prev) => prev.filter((b) => b.id !== businessId));
      }
    } catch {
      alert('Failed to delete');
    }
  }

  async function restoreAll() {
    if (!confirm(`Restore all ${trashedBusinesses.length} leads back to CRM?`)) return;
    try {
      const response = await fetch('/api/businesses/bulk/restore-all', {
        method: 'POST',
      });
      if (response.ok) {
        setBusinesses((prev) => [
          ...trashedBusinesses.map((b) => ({ ...b, isRejected: false, crmStatus: { id: '', status: 'PENDING', notes: null } } as Business)),
          ...prev,
        ]);
        setTrashedBusinesses([]);
      }
    } catch {
      alert('Failed to restore');
    }
  }

  async function emptyTrash() {
    if (!confirm(`Permanently delete all ${trashedBusinesses.length} leads in the recycle bin? This cannot be undone.`)) return;
    try {
      const response = await fetch('/api/businesses/bulk/empty-trash', {
        method: 'POST',
      });
      if (response.ok) {
        setTrashedBusinesses([]);
      }
    } catch {
      alert('Failed to empty recycle bin');
    }
  }

  async function removeAllLeads() {
    if (!confirm(`Move all ${businesses.length} leads to recycle bin?`)) return;
    try {
      const response = await fetch('/api/businesses/bulk/remove-all', {
        method: 'POST',
      });
      if (response.ok) {
        setBusinesses([]);
      }
    } catch {
      alert('Failed to remove leads');
    }
  }

  async function fetchBusinesses() {
    try {
      const response = await fetch('/api/businesses');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setBusinesses(data.businesses);
    } catch {
      setError('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  }

  async function deleteBusiness(businessId: string) {
    if (!confirm('Remove this lead?')) return;

    try {
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBusinesses((prev) => prev.filter((b) => b.id !== businessId));
      } else {
        alert('Failed to delete');
      }
    } catch {
      alert('Network error');
    }
  }

  async function updateStatus(businessId: string, status: string, notes?: string) {
    try {
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });

      if (response.ok) {
        setBusinesses((prev) =>
          prev.map((b) =>
            b.id === businessId
              ? {
                  ...b,
                  crmStatus: {
                    ...b.crmStatus!,
                    status,
                    notes: notes !== undefined ? notes : b.crmStatus?.notes || null,
                  },
                }
              : b
          )
        );
      }
    } catch {
      alert('Failed to update status');
    }
  }

  const categoryLabel = (value: string) =>
    CATEGORIES.find((c) => c.value === value)?.label || value.replace(/_/g, ' ');

  const categories = useMemo(() => {
    const set = new Set(businesses.map((b) => b.category));
    return Array.from(set).sort();
  }, [businesses]);

  const cities = useMemo(() => {
    const set = new Set(businesses.map((b) => b.city).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [businesses]);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      if (filter !== 'ALL' && (b.crmStatus?.status || 'PENDING') !== filter) return false;
      if (categoryFilter !== 'ALL' && b.category !== categoryFilter) return false;
      if (cityFilter !== 'ALL' && b.city !== cityFilter) return false;
      if (websiteFilter === 'NONE' && b.website) return false;
      if (websiteFilter === 'WEAK' && !b.isWeakWebsite) return false;
      if (websiteFilter === 'HAS' && !b.website) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!b.name.toLowerCase().includes(q) && !(b.phone || '').includes(q)) return false;
      }
      return true;
    });
  }, [businesses, filter, categoryFilter, cityFilter, websiteFilter, search]);

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="max-w-5xl mx-auto px-5 py-10">
          <div className="flex items-center justify-center h-80">
            <div className="spinner" style={{ color: 'var(--accent)' }} />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 sm:px-5 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                {showTrash ? 'Recycle Bin' : 'CRM Dashboard'}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {showTrash
                  ? `${trashedBusinesses.length} removed ${trashedBusinesses.length === 1 ? 'lead' : 'leads'}`
                  : `${filteredBusinesses.length} of ${businesses.length} ${businesses.length === 1 ? 'lead' : 'leads'}`}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {showTrash && trashedBusinesses.length > 0 && (
                <>
                  <button
                    onClick={restoreAll}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{ color: 'var(--success)', background: 'var(--success-bg)' }}
                  >
                    Restore all
                  </button>
                  <button
                    onClick={emptyTrash}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{ color: 'var(--danger)', background: 'var(--danger-bg)' }}
                  >
                    Empty bin
                  </button>
                </>
              )}
              {!showTrash && businesses.length > 0 && (
                <button
                  onClick={removeAllLeads}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                  style={{ color: 'var(--danger)', background: 'var(--danger-bg)' }}
                >
                  Remove all
                </button>
              )}
              <button
                onClick={() => setShowTrash(!showTrash)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold"
                style={{
                  color: showTrash ? 'var(--accent-hover)' : 'var(--text-muted)',
                  background: showTrash ? 'var(--accent-light)' : 'var(--surface)',
                  border: `1px solid ${showTrash ? 'var(--accent-subtle)' : 'var(--border)'}`,
                }}
              >
                <RecycleBinIcon />
                {showTrash ? 'Back to CRM' : 'Recycle Bin'}
              </button>
            </div>
          </div>

          {/* Filters - hidden in trash view */}
          {!showTrash && <div className="grid grid-cols-1 sm:flex sm:flex-wrap sm:items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="input-field sm:!w-64"
            />

            <div className="grid grid-cols-2 sm:flex gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field sm:!w-auto"
              >
                <option value="ALL">All statuses</option>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-field sm:!w-auto"
              >
                <option value="ALL">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabel(cat)}
                  </option>
                ))}
              </select>

              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="input-field sm:!w-auto"
              >
                <option value="ALL">All cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <select
                value={websiteFilter}
                onChange={(e) => setWebsiteFilter(e.target.value)}
                className="input-field sm:!w-auto"
              >
                <option value="ALL">All websites</option>
                <option value="NONE">No website</option>
                <option value="WEAK">Free hosting</option>
                <option value="HAS">Has website</option>
              </select>
            </div>
          </div>}
        </div>

        {error && (
          <div
            className="mb-5 text-sm px-4 py-3 rounded-xl font-medium"
            style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}
          >
            {error}
          </div>
        )}

        {/* Trash view */}
        {showTrash && (
          loadingTrash ? (
            <div className="flex items-center justify-center h-40">
              <div className="spinner" style={{ color: 'var(--accent)' }} />
            </div>
          ) : trashedBusinesses.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Recycle bin is empty</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Removed leads will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trashedBusinesses.map((business) => (
                <div key={business.id} className="card p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate mb-1" style={{ color: 'var(--text)' }}>
                        {business.name}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {categoryLabel(business.category)}
                        {business.city && (
                          <><span style={{ color: 'var(--border)' }}> &middot; </span>{business.city}</>
                        )}
                        <span style={{ color: 'var(--border)' }}> &middot; </span>
                        <span className="mono">{business.reviewCount}</span> reviews
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => restoreBusiness(business.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                        style={{ color: 'var(--success)', background: 'var(--success-bg)' }}
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => permanentDelete(business.id)}
                        className="p-1.5 rounded-lg"
                        style={{ color: 'var(--text-muted)' }}
                        title="Permanently delete"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* CRM list */}
        {!showTrash && (filteredBusinesses.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              {businesses.length === 0 ? 'No leads yet' : 'No leads match your filters'}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {businesses.length === 0 ? 'Approve leads from the Review queue to see them here.' : 'Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBusinesses.map((business) => {
              const style = getStatusStyle(business.crmStatus?.status || 'PENDING');
              return (
                <div key={business.id} className="card overflow-hidden">
                  <div className="p-4 sm:p-5">
                    {/* Top row: name + trash */}
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="font-semibold truncate flex-1 min-w-0" style={{ color: 'var(--text)' }}>
                        {business.name}
                      </h3>
                      <button
                        onClick={() => deleteBusiness(business.id)}
                        className="p-1.5 rounded-lg shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                        title="Delete lead"
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    {/* Status + badges row */}
                    <div className="flex items-center flex-wrap gap-2 mb-2.5">
                      <select
                        value={business.crmStatus?.status || 'PENDING'}
                        onChange={(e) => updateStatus(business.id, e.target.value)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg cursor-pointer"
                        style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {!business.website && (
                        <span
                          className="badge shrink-0"
                          style={{ background: 'var(--accent-light)', color: 'var(--accent-hover)' }}
                        >
                          No website
                        </span>
                      )}
                      {business.isWeakWebsite && (
                        <span
                          className="badge shrink-0"
                          style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}
                        >
                          Free hosting
                        </span>
                      )}
                    </div>

                    {/* Meta row */}
                    <p className="text-sm mb-2.5" style={{ color: 'var(--text-muted)' }}>
                      {categoryLabel(business.category)}
                      {business.city && (
                        <><span style={{ color: 'var(--border)' }}> &middot; </span>{business.city}</>
                      )}
                      <span style={{ color: 'var(--border)' }}> &middot; </span>
                      <span className="mono">{business.reviewCount}</span> reviews
                      {business.rating && (
                        <>
                          <span style={{ color: 'var(--border)' }}> &middot; </span>
                          <span className="mono">{business.rating.toFixed(1)}</span> stars
                        </>
                      )}
                    </p>

                    {/* Links row */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                      {business.phone && (
                        <a
                          href={`tel:${business.phone}`}
                          className="flex items-center gap-1.5 font-medium"
                          style={{ color: 'var(--accent)' }}
                        >
                          <PhoneIcon />
                          {business.phone}
                        </a>
                      )}
                      {business.website && (
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 font-medium"
                          style={{ color: 'var(--accent)' }}
                        >
                          <GlobeIcon />
                          Website
                        </a>
                      )}
                      <a
                        href={business.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 font-medium"
                        style={{ color: 'var(--accent)' }}
                      >
                        <MapIcon />
                        Maps
                      </a>
                    </div>
                  </div>

                  {/* Expandable notes footer */}
                  <div style={{ borderTop: '1px solid var(--border-light)' }}>
                    <button
                      onClick={() => toggleNotes(business.id)}
                      className="w-full flex items-center justify-between px-4 sm:px-5 py-2.5 text-xs font-semibold"
                      style={{ color: 'var(--text-muted)', background: 'var(--surface-hover)' }}
                    >
                      <span>
                        {business.crmStatus?.notes
                          ? `Notes: ${business.crmStatus.notes.length > 40 ? business.crmStatus.notes.slice(0, 40) + '...' : business.crmStatus.notes}`
                          : 'Add notes'}
                      </span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        style={{
                          transform: expandedNotes.has(business.id) ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.15s',
                        }}
                      >
                        <path d="M4 6l4 4 4-4" />
                      </svg>
                    </button>
                    {expandedNotes.has(business.id) && (
                      <div className="px-4 sm:px-5 pb-4 pt-2" style={{ background: 'var(--surface-hover)' }}>
                        <textarea
                          defaultValue={business.crmStatus?.notes || ''}
                          placeholder="Write notes about this lead..."
                          className="input-field !text-sm !p-3 resize-none w-full"
                          rows={3}
                          onBlur={(e) =>
                            updateStatus(
                              business.id,
                              business.crmStatus?.status || 'PENDING',
                              e.target.value
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </main>
    </>
  );
}

function PhoneIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.2 1.3H4.5a2 2 0 0 0-2 2v9.4a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V3.3a2 2 0 0 0-2-2H9.8" />
      <line x1="8" y1="12" x2="8" y2="12.01" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" />
      <path d="M2 8h12" />
      <path d="M8 2c2 2.3 2 9.7 0 12" />
      <path d="M8 2c-2 2.3-2 9.7 0 12" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5z" />
      <circle cx="8" cy="6" r="1.5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h10" />
      <path d="M6 4V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V4" />
      <path d="M4.5 4v9a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V4" />
    </svg>
  );
}

function RecycleBinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h10" />
      <path d="M6 4V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V4" />
      <path d="M4.5 4v9a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V4" />
      <path d="M6.5 7v4" />
      <path d="M9.5 7v4" />
    </svg>
  );
}
