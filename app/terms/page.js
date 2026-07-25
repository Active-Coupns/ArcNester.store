'use client';

import React from 'react';
import Link from 'next/link';
import Header from '../../components/Header';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 flex flex-col pb-24 md:pb-0">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 flex flex-col gap-10">
        <div>
          <span className="text-amber-600 font-mono text-xs uppercase tracking-widest font-bold">Standard Agreement</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-4 tracking-tight leading-tight">
            Terms of Service
          </h1>
          <div className="h-1.5 w-20 bg-amber-500 rounded-full mb-8" />
        </div>

        <div className="bg-white border border-slate-100 p-8 sm:p-10 rounded-3xl shadow-sm text-sm text-slate-655 leading-relaxed flex flex-col gap-6 font-light">
          <p>
            By accessing or downloading blueprints from <strong className="font-bold text-slate-800">ArcNester.store</strong>, you agree to follow and be bound by the following Terms of Service.
          </p>

          <h3 className="text-base font-extrabold text-slate-900 mt-4">1. Single-Use Builder License</h3>
          <p>
            All architectural drawings, CAD files, structural layouts, and PDF plan sets downloaded or purchased from this portal are licensed for a <strong className="font-bold text-slate-800">single construction site only</strong>. You may not copy, resell, sublicense, or distribute these plan packages to other building contractors, developers, or architectural catalog websites.
          </p>

          <h3 className="text-base font-extrabold text-slate-900 mt-4">2. Local Compliance and Safety Modifications</h3>
          <p>
            Because geological soils, local municipal wind load models, and regional zoning seismic guidelines vary, all digital drawings must be reviewed and stamped by a locally registered civil engineer or general building contractor before laying foundations. We are not liable for modifications requested by local municipal zoning inspectors.
          </p>

          <h3 className="text-base font-extrabold text-slate-900 mt-4">3. Intellectual Property Rights</h3>
          <p>
            ArcNester.store retains sole ownership, copyrights, and intellectual property rights of all rendering illustrations, technical vector blueprints, and structural catalog layouts.
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
