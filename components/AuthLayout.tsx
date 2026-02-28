'use client';

import { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check auth on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await response.json();
        setIsAuthenticated(data.valid);
        if (!data.valid) {
          localStorage.removeItem('auth_token');
        }
      } catch {
        setIsAuthenticated(false);
        localStorage.removeItem('auth_token');
      }
    };

    checkAuth();

    // Sync auth state across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        if (e.newValue) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = (token: string) => {
    localStorage.setItem('auth_token', token);
    setIsAuthenticated(true);
    // Notify other tabs of login
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'auth_token',
      newValue: token
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    // Notify other tabs of logout
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'auth_token',
      newValue: null
    }));
  };

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Show content if authenticated
  return <>{children}</>;
}