'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import AuthLayout from '@/components/AuthLayout';

interface Business {
  placeId: string;
  name: string;
  category: string;
  phone: string | null;
  website: string | null;
  mapsUrl: string;
  reviewCount: number;
  isWeakWebsite: boolean;
  weakFlags: string[];
  isOpen: boolean | null;
}

export default function DiscoverPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('searchResults');
    if (saved) {
      setBusinesses(JSON.parse(saved));
    }
    setFetching(false);
  }, []);

  async function handleAction(action: 'approve' | 'reject') {
    if (currentIndex >= businesses.length) return;

    const business = businesses[currentIndex];
    
    if (!business.placeId) {
      setMessage('Error: Missing placeId');
      return;
    }
    
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
        setMessage(action === 'approve' ? 'Saved!' : 'Rejected');
        setTimeout(() => setMessage(''), 1000);
        setCurrentIndex((prev) => prev + 1);
      } else {
        setMessage('Error');
        setTimeout(() => setMessage(''), 2000);
      }
    } catch {
      setMessage('Network error');
      setTimeout(() => setMessage(''), 2000);
    } finally {
      setLoading(false);
    }
  }

  const currentBusiness = businesses[currentIndex];

  if (fetching) {
    return (
      <AuthLayout>
        <Navigation />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </main>
      </AuthLayout>
    );
  }

  if (businesses.length === 0) {
    return (
      <AuthLayout>
        <Navigation />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No businesses to review.</p>
            <a href="/setup" className="text-blue-600 hover:underline">
              Run a search first
            </a>
          </div>
        </main>
      </AuthLayout>
    );
  }

  if (currentIndex >= businesses.length) {
    return (
      <AuthLayout>
        <Navigation />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">All caught up!</p>
            <a href="/setup" className="text-blue-600 hover:underline">
              Search for more
            </a>
          </div>
        </main>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {businesses.length}
          </span>
          {message && (
            <span className={`text-sm font-medium ${message === 'Saved!' ? 'text-green-600' : message === 'Rejected' ? 'text-red-600' : 'text-gray-600'}`}>
              {message}
            </span>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          {/* Fixed height content area */}
          <div className="p-6 h-[320px] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 leading-tight">{currentBusiness.name}</h2>
              {currentBusiness.isOpen !== null && (
                <span className={`px-2 py-1 rounded text-xs font-medium ${currentBusiness.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {currentBusiness.isOpen ? 'Open' : 'Closed'}
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="text-gray-500 w-20 shrink-0">Category</span>
                <span className="text-gray-900 capitalize">{currentBusiness.category.replace(/_/g, ' ')}</span>
              </div>

              <div className="flex">
                <span className="text-gray-500 w-20 shrink-0">Reviews</span>
                <span className="text-gray-900">{currentBusiness.reviewCount}</span>
              </div>

              {currentBusiness.phone && (
                <div className="flex">
                  <span className="text-gray-500 w-20 shrink-0">Phone</span>
                  <a href={`tel:${currentBusiness.phone}`} className="text-blue-600 hover:underline">
                    {currentBusiness.phone}
                  </a>
                </div>
              )}

              {currentBusiness.website && (
                <div className="flex">
                  <span className="text-gray-500 w-20 shrink-0">Website</span>
                  <a href={currentBusiness.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                    {currentBusiness.website}
                  </a>
                </div>
              )}

              <div className="flex">
                <span className="text-gray-500 w-20 shrink-0">Maps</span>
                <a href={currentBusiness.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  View profile
                </a>
              </div>
            </div>

            {/* Alerts section */}
            <div className="mt-4 space-y-2">
              {currentBusiness.isWeakWebsite && currentBusiness.weakFlags.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                  <div className="text-sm font-medium text-amber-800 mb-1">Weak website detected</div>
                  <div className="flex flex-wrap gap-1">
                    {currentBusiness.weakFlags.map((flag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!currentBusiness.website && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-sm font-medium text-blue-800">No website</div>
                  <div className="text-sm text-blue-600">Great opportunity</div>
                </div>
              )}
            </div>
          </div>

          {/* Fixed position buttons */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={() => handleAction('reject')}
                disabled={loading}
                className="flex-1 py-2.5 px-4 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></span>
                  </span>
                ) : (
                  'Reject'
                )}
              </button>
              <button
                onClick={() => handleAction('approve')}
                disabled={loading}
                className="flex-1 py-2.5 px-4 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  </span>
                ) : (
                  'Save to CRM'
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </AuthLayout>
  );
}
