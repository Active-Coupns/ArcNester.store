'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Browse Catalog', href: '/' },
    { label: 'Estimator Tools', href: '/tools' },
    { label: 'Loans & Insurance', href: '/financing' },
    { label: 'Contact Us', href: '/contact' }
  ];

  return (
    <header className="border-b border-slate-100 bg-white/90 backdrop-blur sticky top-0 z-50 shadow-sm w-full">
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
        <div className="md:hidden border-t border-slate-100 bg-white shadow-xl absolute top-20 left-0 right-0 py-4 px-6 flex flex-col gap-4 z-50">
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
