'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import AuthLayout from '@/components/AuthLayout';

interface Business {
  id: string;
  placeId: string;
  name: string;
  category: string;
  phone: string | null;
  website: string | null;
  mapsUrl: string;
  reviewCount: number;
  isWeakWebsite: boolean;
  createdAt: string;
  crmStatus: {
    id: string;
    status: string;
    notes: string | null;
  } | null;
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  { value: 'CALLED', label: 'Called', color: 'bg-blue-100 text-blue-700' },
  { value: 'INTERESTED', label: 'Interested', color: 'bg-green-100 text-green-700' },
  { value: 'CALLBACK', label: 'Callback', color: 'bg-amber-100 text-amber-700' },
  { value: 'NOT_INTERESTED', label: 'Not interested', color: 'bg-red-100 text-red-700' },
];

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchBusinesses();
  }, []);

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

  async function updateStatus(businessId: string, status: string, notes?: string) {
    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-status',
          businessId,
          status,
          notes,
        }),
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
                    notes: notes || b.crmStatus?.notes || null,
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

  const filteredBusinesses =
    filter === 'ALL'
      ? businesses
      : businesses.filter((b) => b.crmStatus?.status === filter);

  if (loading) {
    return (
      <AuthLayout>
        <Navigation />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </main>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">CRM Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">{businesses.length} leads</p>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <option value="ALL">All statuses</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

        {filteredBusinesses.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No businesses found. Start by approving leads from Discover.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBusinesses.map((business) => (
              <div key={business.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{business.name}</h3>
                      {business.isWeakWebsite && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                          Weak site
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 capitalize mb-2">
                      {business.category.replace(/_/g, ' ')} · {business.reviewCount} reviews
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      {business.phone && (
                        <a href={`tel:${business.phone}`} className="text-blue-600 hover:underline">
                          {business.phone}
                        </a>
                      )}
                      {business.website && (
                        <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Website
                        </a>
                      )}
                      <a href={business.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Maps
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <select
                      value={business.crmStatus?.status || 'PENDING'}
                      onChange={(e) => updateStatus(business.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded border-0 ${
                        STATUS_OPTIONS.find(
                          (opt) => opt.value === (business.crmStatus?.status || 'PENDING')
                        )?.color || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    
                    <textarea
                      defaultValue={business.crmStatus?.notes || ''}
                      placeholder="Add notes..."
                      className="w-40 text-xs p-2 border border-gray-200 rounded resize-none focus:outline-none focus:ring-1 focus:ring-gray-300"
                      rows={2}
                      onBlur={(e) =>
                        updateStatus(
                          business.id,
                          business.crmStatus?.status || 'PENDING',
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </AuthLayout>
  );
}
