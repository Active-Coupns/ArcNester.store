'use client';

import React from 'react';
import Link from 'next/link';
import Header from '../../components/Header';

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 flex flex-col pb-24 md:pb-0">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 flex flex-col gap-10">
        <div>
          <span className="text-amber-600 font-mono text-xs uppercase tracking-widest font-bold">Zoning & Cost Disclaimers</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-4 tracking-tight leading-tight">
            Disclaimer
          </h1>
          <div className="h-1.5 w-20 bg-amber-500 rounded-full mb-8" />
        </div>

        <div className="bg-white border border-slate-100 p-8 sm:p-10 rounded-3xl shadow-sm text-sm text-slate-655 leading-relaxed flex flex-col gap-6 font-light">
          <p>
            Please read the following disclaimer details carefully before using any estimators or construction plan layout drawings distributed by <strong className="font-bold text-slate-800">ArcNester.store</strong>.
          </p>

          <h3 className="text-base font-extrabold text-slate-900 mt-4">1. Estimates are Approximations Only</h3>
          <p>
            All costs calculated using our dynamic web widgets (e.g. Paint, Tiles, Cement, Steel, and general building budgets) are calculated using baseline general metrics. They do <strong className="font-bold text-slate-800">not</strong> represent firm contractor binding quotes, nor do they factor in regional raw material shortages, premium labor costs, or complex site excavation fees.
          </p>

          <h3 className="text-base font-extrabold text-slate-900 mt-4">2. Professional Engineering Requirement</h3>
          <p>
            The drawings and templates provided on this portal are for architectural conceptual purposes. They must be reviewed, localized, and approved by a licensed civil engineer or registered surveyor in your municipality before breaking ground or submitting files for building permits. We hold zero liability for structural structural failures, soil shifts, or zoning denials.
          </p>
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
