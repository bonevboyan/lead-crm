'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Invalid password');
        return;
      }

      router.push('/setup');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-5"
            style={{
              background: 'var(--accent)',
              color: '#FFF',
              boxShadow: '0 4px 14px rgba(184, 128, 90, 0.3)',
            }}
          >
            S
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--text)' }}
          >
            Svraki
          </h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
            Enter your password to continue
          </p>
        </div>

        <div className="card p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input-field"
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <div
                className="text-sm px-3.5 py-2.5 rounded-xl font-medium"
                style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <span className="spinner" style={{ borderTopColor: 'var(--bg)' }} />
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
