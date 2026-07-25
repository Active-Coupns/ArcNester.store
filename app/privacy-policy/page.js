'use client';

import React from 'react';
import Link from 'next/link';
import Header from '../../components/Header';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 flex flex-col pb-24 md:pb-0">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 flex flex-col gap-10">
        <div>
          <span className="text-amber-600 font-mono text-xs uppercase tracking-widest font-bold">Regulatory Disclosures</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-4 tracking-tight leading-tight">
            Privacy Policy
          </h1>
          <div className="h-1.5 w-20 bg-amber-500 rounded-full mb-8" />
        </div>

        <div className="bg-white border border-slate-100 p-8 sm:p-10 rounded-3xl shadow-sm text-sm text-slate-655 leading-relaxed flex flex-col gap-6 font-light">
          <p>
            At <strong className="font-bold text-slate-800">ArcNester.store</strong>, accessible from our portal, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by ArcNester.store and how we use it.
          </p>

          <h3 className="text-base font-extrabold text-slate-900 mt-4">1. Cookies and Web Beacons</h3>
          <p>
            Like any other website, ArcNester.store uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
          </p>

          <h3 className="text-base font-extrabold text-slate-900 mt-4">2. Google DoubleClick DART Cookie</h3>
          <p>
            Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" className="text-amber-600 hover:underline">https://policies.google.com/technologies/ads</a>.
          </p>

          <h3 className="text-base font-extrabold text-slate-900 mt-4">3. Log Files</h3>
          <p>
            ArcNester.store follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.
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
