'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { LogOut, Bookmark, Inbox, UserCircle, Bot, Menu, X, TagIcon, Moon, Sun } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

// Routes that should be full-screen (no navbar/footer)
const FULLSCREEN_ROUTES = ['/chat'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');
  const pathname = usePathname();
  const userMenuRef = React.useRef<HTMLDivElement | null>(null);

  // Hide chrome on full-screen routes
  const isFullscreen = FULLSCREEN_ROUTES.some((r) => pathname.startsWith(r));

  React.useEffect(() => {
    const storedTheme = localStorage.getItem('intellifone-theme');
    const nextTheme = storedTheme === 'light' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.classList.toggle('light-theme', nextTheme === 'light');

    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      sub?.subscription.unsubscribe();
    };
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!isUserMenuOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const el = userMenuRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      localStorage.setItem('intellifone-theme', next);
      document.documentElement.classList.toggle('light-theme', next === 'light');
      return next;
    });
  };

  const navLinks = [
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/add', label: 'Sell' },
    { href: '/damage-detection', label: 'Damage Detection' },
    { href: '/recommendation', label: 'Recommendations' },
    { href: '/about', label: 'About' },
    { href: '/contactus', label: 'Contact Us' },
  ];

  const isActive = (href: string) => pathname === href;

  // Full-screen layout — no navbar, no footer, children fill viewport
  if (isFullscreen) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header
        className="glass-panel sticky top-0 z-50 border-b border-gray-800"
        style={{
          background: 'var(--shell-bg)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--shell-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold shrink-0">
            <BrandLogo size={34} />
            <span className="text-[#f7f435] font-accent">IntelliFone</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(href)
                    ? 'text-[#f7f435] bg-[#f7f435]/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex gap-2 items-center">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all text-gray-300 hover:text-[#f7f435] hover:bg-[#f7f435]/10"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>

            {user ? (
              <>
                {/* AI Chat */}
                <Link
                  href="/chat"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive('/chat')
                      ? 'bg-[#f7f435] text-black'
                      : 'text-gray-300 hover:text-[#f7f435] hover:bg-[#f7f435]/10'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  <span>AI Chat</span>
                </Link>

                {/* Inbox */}
                <Link
                  href="/chats"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive('/chats')
                      ? 'bg-[#f7f435] text-black'
                      : 'text-gray-300 hover:text-[#f7f435] hover:bg-[#f7f435]/10'
                  }`}
                >
                  <Inbox className="w-4 h-4" />
                  <span>Inbox</span>
                </Link>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={isUserMenuOpen}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all text-gray-300 hover:text-[#f7f435] hover:bg-[#f7f435]/10"
                  >
                    <Menu className="w-4 h-4" />
                    <span className="sr-only">Menu</span>
                  </button>

                  {isUserMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-800 bg-[#0e0e10] shadow-xl overflow-hidden z-50"
                    >
                      <Link
                        href="/sell-phone"
                        role="menuitem"
                        className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-all ${
                          isActive('/sell-phone')
                            ? 'bg-[#f7f435] text-black'
                            : 'text-gray-300 hover:text-[#f7f435] hover:bg-[#f7f435]/10'
                        }`}
                      >
                        <TagIcon className="w-4 h-4" />
                        <span>Get Price</span>
                      </Link>

                      <Link
                        href="/saved"
                        role="menuitem"
                        className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-all ${
                          isActive('/saved')
                            ? 'bg-[#f7f435] text-black'
                            : 'text-gray-300 hover:text-[#f7f435] hover:bg-[#f7f435]/10'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                        <span>Saved</span>
                      </Link>

                      <Link
                        href="/profile"
                        role="menuitem"
                        className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-all ${
                          isActive('/profile')
                            ? 'bg-[#f7f435] text-black'
                            : 'text-gray-300 hover:text-[#f7f435] hover:bg-[#f7f435]/10'
                        }`}
                      >
                        <UserCircle className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-sm font-medium text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-black"
                  style={{ backgroundColor: '#f7f435' }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-white/10 transition-all"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-[#0e0e10]">
            <div className="px-4 py-3 flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(href) ? 'text-[#f7f435] bg-[#f7f435]/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </Link>
              ))}

              <div className="my-2 border-t border-gray-800" />

              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-[#f7f435] hover:bg-[#f7f435]/10 transition-all w-full text-left"
                aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span>{theme === 'light' ? 'Dark theme' : 'Light theme'}</span>
              </button>

              {user ? (
                <>
                  <Link href="/chat" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-[#f7f435] hover:bg-[#f7f435]/10 transition-all">
                    <Bot className="w-4 h-4" /> AI Chat
                  </Link>
                  <Link href="/chats" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-[#f7f435] hover:bg-[#f7f435]/10 transition-all">
                    <Inbox className="w-4 h-4" /> Inbox
                  </Link>
                  <Link href="/sell-phone" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-[#f7f435] hover:bg-[#f7f435]/10 transition-all">
                    <TagIcon className="w-4 h-4" /> Get Price
                  </Link>
                  <Link href="/saved" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-[#f7f435] hover:bg-[#f7f435]/10 transition-all">
                    <Bookmark className="w-4 h-4" /> Saved
                  </Link>
                  <Link href="/profile" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-[#f7f435] hover:bg-[#f7f435]/10 transition-all">
                    <UserCircle className="w-4 h-4" /> Profile
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all w-full text-left">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/signin" className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all">Login</Link>
                  <Link href="/signup" className="px-3 py-2.5 rounded-lg text-sm font-semibold text-black text-center" style={{ backgroundColor: '#f7f435' }}>Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer className="glass-panel border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 text-xl font-bold mb-4">
                <BrandLogo size={34} />
                <span className="text-[#f7f435] font-accent">IntelliFone</span>
              </div>
              <p className="text-gray-400 text-sm">
                Buy & sell used phones with confidence using AI-powered verification.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <Link href="/">Home</Link>
                <Link href="/marketplace">Marketplace</Link>
                <Link href="/add">Sell Phone</Link>
                <Link href="/about">About Us</Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <Link href="/contactus">Contact Us</Link>
                <Link href="/helpcenter">Help Center</Link>
                <Link href="/privacypolicy">Privacy Policy</Link>
                <Link href="/termsofservice">Terms of Service</Link>
              </div>
            </div>

            {/* Social */}
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <a href="#" className="hover:text-[#f7f435]">Twitter</a>
                <a href="#" className="hover:text-[#f7f435]">Facebook</a>
                <a href="#" className="hover:text-[#f7f435]">Instagram</a>
                <a href="#" className="hover:text-[#f7f435]">LinkedIn</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2025 IntelliFone. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
