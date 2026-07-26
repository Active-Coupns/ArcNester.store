'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden for SSR safety

  useEffect(() => {
    const dismissed = localStorage.getItem('arcnester_banner_dismissed') === 'true';
    setIsDismissed(dismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('arcnester_banner_dismissed', 'true');
    setIsDismissed(true);
  };

  const navItems = [
    { label: 'Browse Catalog', href: '/' },
    { label: 'Estimator Tools', href: '/tools' },
    { label: 'Loans & Insurance', href: '/financing' },
    { label: 'Contact Us', href: '/contact' }
  ];

  return (
    <header className="border-b border-slate-100 bg-white/90 backdrop-blur sticky top-0 z-50 shadow-sm w-full">
      {/* Sticky Top Announcement Banner */}
      {!isDismissed && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 py-1.5 sm:py-2.5 px-2 sm:px-4 w-full relative z-50 flex items-center justify-between text-[10px] sm:text-xs md:text-sm font-medium shadow-md transition-all duration-300">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 text-center pr-6 sm:pr-0">
            <span className="inline-flex items-center gap-1 bg-slate-950/15 border border-slate-950/20 px-1.5 sm:px-2.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-wider animate-pulse shadow-sm">
              Today's Offer
            </span>
            <span className="flex items-center gap-1 leading-snug">
              <span>🏦</span>
              <span>Need Financing for your Home Plan? Instant Home Loan & Construction Insurance Available!</span>
            </span>
            <Link 
              href="/financing" 
              className="bg-slate-950 text-amber-400 font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[11px] hover:bg-slate-800 transition shadow-sm shrink-0 whitespace-nowrap"
            >
              Check Loan Offers →
            </Link>
          </div>
          <button
            onClick={handleDismiss}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-950/10 rounded-full transition text-slate-800 hover:text-slate-950 cursor-pointer"
            aria-label="Dismiss announcement"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Nav Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-white text-xl shadow-md shadow-amber-500/20">
            N
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">ArcNester</span>
            <span className="text-amber-500 font-bold ml-0.5">.store</span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`${isActive ? 'text-amber-500 border-b-2 border-amber-500 pb-1' : 'hover:text-slate-900 transition'}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white shadow-xl absolute top-full left-0 right-0 py-4 px-6 flex flex-col gap-4 z-50">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2.5 px-3 rounded-xl font-bold text-sm transition ${
                  isActive ? 'bg-amber-50 text-amber-500' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
