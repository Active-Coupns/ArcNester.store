'use client';

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 flex flex-col pb-24 md:pb-0">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/90 backdrop-blur sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-white text-xl shadow-md">
              N
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">ArcNester</span>
              <span className="text-amber-500 font-bold ml-0.5">.store</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition">Browse Catalog</Link>
            <Link href="/tools" className="hover:text-slate-900 transition">Estimator Tools</Link>
            <Link href="/financing" className="hover:text-slate-900 transition">Loans & Insurance</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 flex flex-col gap-10">
        <div>
          <span className="text-amber-600 font-mono text-xs uppercase tracking-widest font-bold">About Our Studio</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-4 tracking-tight leading-tight">
            Engineering Precision Blueprints
          </h1>
          <div className="h-1.5 w-20 bg-amber-500 rounded-full mb-8" />
        </div>

        <div className="bg-white border border-slate-100 p-8 sm:p-10 rounded-3xl shadow-sm text-sm text-slate-655 leading-relaxed flex flex-col gap-6 font-light">
          <p>
            Welcome to <strong className="font-extrabold text-slate-800">ArcNester.store</strong>, where we bridge the gap between architectural vision and ready-to-construct execution drawings. Founded by a consortium of civil engineers, interior designers, and general contractors, our mission is to offer premium floor plan design sets directly to builders and homeowners without the excessive premiums of traditional boutique design studios.
          </p>

          <p>
            Every plan in our library is built from the ground up, factoring in structural load constraints, spatial planning optimizations, local building code compliance, and proper wind flow/sunlight exposure orientations.
          </p>

          <h3 className="text-base font-extrabold text-slate-900 mt-4">Why Choose ArcNester.store?</h3>
          <ul className="list-disc pl-6 flex flex-col gap-2.5">
            <li><strong className="font-bold text-slate-800">Vastu-Compliant Structures</strong>: Optimized configuration setups for positive energy flow, orientation, and layout mapping.</li>
            <li><strong className="font-bold text-slate-800">Complete Design Packs</strong>: Includes front and side elevation blueprints, structural foundation columns layouts, plumbing drawings, and electrical layouts.</li>
            <li><strong className="font-bold text-slate-800">Instant Digital Delivery</strong>: High-resolution PDF prints ready for submission to zoning authorities or general contractors.</li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-12 text-slate-500 text-sm text-center mt-auto">
        <p>© {new Date().getFullYear()} ArcNester.store Architectural Studio. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4 text-xs font-semibold text-slate-400">
          <Link href="/about" className="hover:text-amber-500 transition">About Us</Link>
          <Link href="/privacy-policy" className="hover:text-amber-500 transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-amber-500 transition">Terms of Service</Link>
          <Link href="/refund-policy" className="hover:text-amber-500 transition">Refund Policy</Link>
          <Link href="/disclaimer" className="hover:text-amber-500 transition">Disclaimer</Link>
          <Link href="/contact" className="hover:text-amber-500 transition">Contact Us</Link>
        </div>
      </footer>
    </div>
  );
}
