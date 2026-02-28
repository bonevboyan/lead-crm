'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import AuthLayout from '@/components/AuthLayout';
import { CITIES, CATEGORIES } from '@/lib/cities';

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

export default function SetupPage() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('reviews-desc');
  const [filterWebsite, setFilterWebsite] = useState('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Business[]>([]);
  const [error, setError] = useState('');

  async function handleSearch() {
    if (!selectedCity || !selectedCategory) {
      setError('Please select both city and category');
      return;
    }

    setError('');
    setLoading(true);
    setResults([]);

    try {
      const response = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId: selectedCity,
          category: selectedCategory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Search failed');
        return;
      }

      let businesses = data.results;

      if (filterWebsite === 'has') {
        businesses = businesses.filter((b: Business) => b.website);
      } else if (filterWebsite === 'no') {
        businesses = businesses.filter((b: Business) => !b.website);
      }

      businesses.sort((a: Business, b: Business) => {
        switch (sortBy) {
          case 'reviews-desc':
            return b.reviewCount - a.reviewCount;
          case 'reviews-asc':
            return a.reviewCount - b.reviewCount;
          default:
            return 0;
        }
      });

      setResults(businesses);
      sessionStorage.setItem('searchResults', JSON.stringify(businesses));
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Search</h1>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
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
              <label className="block text-sm text-gray-600 mb-1.5">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
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

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value="reviews-desc">Reviews: high to low</option>
                <option value="reviews-asc">Reviews: low to high</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Website</label>
              <select
                value={filterWebsite}
                onChange={(e) => setFilterWebsite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value="all">All</option>
                <option value="has">Has website</option>
                <option value="no">No website</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-4 text-red-600 text-sm">{error}</div>
          )}

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full py-2.5 bg-gray-900 text-white rounded font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Searching...
              </span>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <span className="text-green-800 text-sm">
              Found {results.length} businesses
            </span>
            <a
              href="/discover"
              className="text-sm font-medium text-green-800 hover:underline"
            >
              Start reviewing
            </a>
          </div>
        )}
      </main>
    </AuthLayout>
  );
}
