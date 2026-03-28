'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/setup', label: 'Search', icon: SearchIcon },
    { href: '/discover', label: 'Review', icon: StackIcon },
    { href: '/dashboard', label: 'CRM', icon: GridIcon },
  ];

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden sm:block" style={{ background: 'var(--nav-bg)' }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-center justify-between h-14">
            <Link href="/setup" className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ background: 'var(--accent)', color: '#FFF' }}
              >
                S
              </div>
              <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--nav-active)' }}>
                Svraki
              </span>
            </Link>

            <div className="flex items-center gap-0.5">
              {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm"
                    style={{
                      color: isActive ? 'var(--nav-active)' : 'var(--nav-text)',
                      background: isActive ? 'var(--nav-hover)' : 'transparent',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    <Icon size={15} />
                    {link.label}
                  </Link>
                );
              })}

              <div className="w-px h-5 mx-2" style={{ background: 'rgba(255,255,255,0.1)' }} />

              <button
                onClick={() => {
                  document.cookie = 'auth_token=; path=/; max-age=0';
                  window.location.href = '/login';
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                style={{ color: 'var(--nav-text)' }}
              >
                <LogoutIcon size={15} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'var(--nav-bg)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-around h-14">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center gap-1 px-4 py-1.5"
                style={{
                  color: isActive ? 'var(--nav-active)' : 'var(--nav-text)',
                }}
              >
                <Icon size={18} />
                <span className="text-[10px] font-semibold">{link.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => {
              document.cookie = 'auth_token=; path=/; max-age=0';
              window.location.href = '/login';
            }}
            className="flex flex-col items-center gap-1 px-4 py-1.5"
            style={{ color: 'var(--nav-text)' }}
          >
            <LogoutIcon size={18} />
            <span className="text-[10px] font-semibold">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}

function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  );
}

function StackIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5l6-3 6 3-6 3-6-3z" />
      <path d="M2 8l6 3 6-3" />
      <path d="M2 11l6 3 6-3" />
    </svg>
  );
}

function GridIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
      <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    </svg>
  );
}

function LogoutIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 14H3.5a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 3.5 2H6" />
      <path d="M10.5 11.5L14 8l-3.5-3.5" />
      <path d="M14 8H6" />
    </svg>
  );
}
