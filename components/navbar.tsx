'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Wallet } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { data: session, status } = useSession();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Blogs', href: '/blogs' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy', href: '/privacy' },
  ];

  return (
    <nav className="sticky top-4 z-40 mx-auto max-w-7xl px-6">
      <div className="flex items-center justify-between rounded-2xl bg-white/90 px-6 py-4 shadow-sm backdrop-blur">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-sm">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            <span className="text-slate-900">Expenses</span>
            <span className="text-indigo-600">Tracker</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="relative">
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-2 left-0 h-0.5 w-5 rounded-full bg-indigo-600" />
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {status === 'authenticated' ? (
            <div className="hidden items-center gap-3 md:flex">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="rounded-lg bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-200 transition cursor-pointer"
                >
                  {session?.user?.name || session?.user?.email}
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-12 mt-2 rounded-lg border border-indigo-200 bg-white shadow-lg z-50 min-w-48">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-indigo-50 transition border-b border-slate-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut({ callbackUrl: '/auth/login' });
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 md:inline-flex animate-pulse-zoom"
            >
              Sign In
            </Link>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-md p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mt-3 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-sm backdrop-blur lg:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="mt-3 border-t border-slate-200 pt-3">
            {status === 'authenticated' ? (
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  className="block rounded-lg bg-indigo-100 px-3 py-2 text-center text-sm font-semibold text-indigo-700 hover:bg-indigo-200 transition cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut({ callbackUrl: '/auth/login' });
                  }}
                  className="w-full rounded-lg border border-red-200 px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="block rounded-lg bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 px-3 py-2 text-center text-sm font-semibold text-white animate-pulse-zoom"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

