'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function AnnouncementBanner() {
  const [isDismissed, setIsDismissed] = useState(false); // Start false to force visibility immediately

  useEffect(() => {
    const dismissed = localStorage.getItem('arcnester_banner_dismissed_v3') === 'true';
    setIsDismissed(dismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('arcnester_banner_dismissed_v3', 'true');
    setIsDismissed(true);
    document.body.classList.remove('has-banner');
  };

  useEffect(() => {
    if (!isDismissed) {
      document.body.classList.add('has-banner');
    } else {
      document.body.classList.remove('has-banner');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('has-banner');
    };
  }, [isDismissed]);

  if (isDismissed) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[9999] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 py-1.5 sm:py-2 px-2 sm:px-4 flex items-center justify-between text-[10px] sm:text-xs md:text-sm font-medium shadow-md transition-all duration-300">
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
  );
}
