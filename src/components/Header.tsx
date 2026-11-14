import React, { useState } from 'react';
import { ShieldCheck, Menu, X, ArrowRight, User as UserIcon, LogOut } from 'lucide-react';
import { navigateTo } from './router';
import { useAuth } from '../lib/auth';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  currentPath: string;
}

export const Header: React.FC<HeaderProps> = ({ currentPath }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();

  // "Reports" is only included in navigation links when user is logged in
  const navLinks = user
    ? [
        { label: 'Home', path: '/' },
        { label: 'Check a document', path: '/check' },
        { label: 'My Reports', path: '/reports' },
      ]
    : [
        { label: 'Home', path: '/' },
        { label: 'Check a document', path: '/check' },
      ];

  const isActive = (path: string) => {
    return path === '/' ? currentPath === '/' : currentPath.startsWith(path);
  };

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    navigateTo(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <button
            type="button"
            onClick={() => handleNav('/')}
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/30">
              <ShieldCheck className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              OriginCheck
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => handleNav(link.path)}
                className={`rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => handleNav('/check')}
              className="ml-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
            >
              Check document
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Auth Profile / Login Button */}
            <div className="ml-3 pl-3 border-l border-slate-200">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    <UserIcon className="h-3.5 w-3.5" />
                    <span className="max-w-[120px] truncate">
                      {user.email || user.phone || 'My Account'}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    title="Sign out"
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600 transition"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
                >
                  Sign in
                </button>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Nav dropdown */}
        {mobileMenuOpen && (
          <div className="border-b border-blue-100 bg-white px-6 py-4 md:hidden">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => handleNav(link.path)}
                  className={`flex w-full items-center rounded-lg px-3.5 py-2.5 text-left text-sm font-medium ${
                    isActive(link.path)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleNav('/check')}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Check document
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="mt-3 pt-3 border-t border-slate-100">
                {user ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 truncate">
                      {user.email || user.phone}
                    </span>
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="w-full rounded-lg border border-slate-200 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Sign in / Register
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};
