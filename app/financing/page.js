'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import { 
  ShieldCheck,
  Building,
  MapPin,
  Loader
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function FinancingPage() {
  const [loading, setLoading] = useState(true);
  const [detectedCountry, setDetectedCountry] = useState('GLOBAL');
  const [loanOffers, setLoanOffers] = useState([]);
  const [insuranceOffers, setInsuranceOffers] = useState([]);

  // Fallback defaults in case Supabase table is empty
  const defaultLoans = [
    {
      id: 'fallback-loan-1',
      title: 'ArcNester.store Partner Construction Loans',
      description: 'Pre-approved low interest rates up to $500,000 for residential home construction.',
      button_text: 'Apply for Home Loan ➔',
      target_link: 'https://www.creditsaison.in',
      country_code: 'GLOBAL'
    }
  ];

  const defaultInsurance = [
    {
      id: 'fallback-ins-1',
      title: 'Acko Comprehensive Builder Insurance',
      description: 'Structural integrity guarantee and construction liability insurance plans.',
      button_text: 'Get Insurance Quotes ➔',
      target_link: 'https://www.acko.com',
      country_code: 'GLOBAL'
    }
  ];

  useEffect(() => {
    async function loadFinancingOffers() {
      setLoading(true);
      try {
        let country = 'GLOBAL';
        
        // 1. Detect Country via URL Override or API
        const urlParams = new URLSearchParams(window.location.search);
        const testCountry = urlParams.get('test_country');
        if (testCountry) {
          country = testCountry.toUpperCase();
        } else {
          try {
            const geoRes = await fetch('https://ipapi.co/json/');
            const geoData = await geoRes.json();
            if (geoData && geoData.country_code) {
              country = geoData.country_code.toUpperCase();
            }
          } catch (geoErr) {
            console.error("Geo-IP lookup failed, using GLOBAL:", geoErr);
          }
        }
        setDetectedCountry(country);

        // 2. Fetch Active Offers from Supabase matching CATEGORY
        const { data, error } = await supabase
          .from('affiliate_offers')
          .select('*')
          .eq('is_active', true)
          .in('category', ['HOME_LOAN', 'PROPERTY_INSURANCE']);

        if (!error && data) {
          // Filter offers matching user country OR GLOBAL
          const filtered = data.filter(
            (o) => o.country_code === country || o.country_code === 'GLOBAL'
          );

          const loans = filtered.filter((o) => o.category === 'HOME_LOAN');
          const ins = filtered.filter((o) => o.category === 'PROPERTY_INSURANCE');

          setLoanOffers(loans.length > 0 ? loans : defaultLoans);
          setInsuranceOffers(ins.length > 0 ? ins : defaultInsurance);
        } else {
          setLoanOffers(defaultLoans);
          setInsuranceOffers(defaultInsurance);
        }
      } catch (err) {
        console.error("Financing fetch failed:", err);
        setLoanOffers(defaultLoans);
        setInsuranceOffers(defaultInsurance);
      } finally {
        setLoading(false);
      }
    }

    loadFinancingOffers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 flex flex-col pb-24 md:pb-0">
      
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-100 py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-indigo-500/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 w-fit mx-auto">
            <MapPin className="h-4 w-4" />
            <span>Targeting Region: <strong className="uppercase font-extrabold">{detectedCountry}</strong></span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Construction Financing & Insurance Hub
          </h1>
          <p className="text-slate-550 text-base font-light max-w-2xl mx-auto mt-4 leading-relaxed">
            Compare and apply for pre-approved home building loans, structural credit facilities, and property builders risk coverage tailored to your geographic location.
          </p>
        </div>
      </section>

      {/* Offers Layout Grid */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col gap-16 overflow-x-hidden">
        {loading ? (
          <div className="text-center py-40">
            <Loader className="animate-spin h-12 w-12 text-amber-500 mx-auto" />
            <span className="text-xs text-slate-450 block mt-2">Customizing geo-targeted offers...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* Left: Loans Section */}
            <div className="flex flex-col gap-6">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <Building className="h-6 w-6 text-amber-600" />
                <h2 className="text-xl font-bold text-slate-900">Pre-Approved Building Loans</h2>
              </div>

              <div className="flex flex-col gap-4">
                {loanOffers.map((offer) => (
                  <div key={offer.id} className="bg-white border border-slate-100 hover:border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-4 transition duration-300">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 w-fit">
                      {offer.country_code === 'GLOBAL' ? '🌐 Partner Loan' : `🇺🇸 Exclusive ${offer.country_code} Deal`}
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-tight">{offer.title}</h3>
                      <p className="text-slate-450 text-xs mt-1.5 leading-relaxed font-light">{offer.description}</p>
                    </div>
                    <a
                      href={offer.target_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl transition duration-200 text-xs shadow-md flex items-center justify-center gap-1 active:scale-95"
                    >
                      <span>{offer.button_text || 'Apply Now ➔'}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Insurance Section */}
            <div className="flex flex-col gap-6">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-indigo-650" />
                <h2 className="text-xl font-bold text-slate-900">Property & Build Insurance</h2>
              </div>

              <div className="flex flex-col gap-4">
                {insuranceOffers.map((offer) => (
                  <div key={offer.id} className="bg-white border border-slate-100 hover:border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-4 transition duration-300">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full px-2.5 py-1 w-fit">
                      {offer.country_code === 'GLOBAL' ? '🌐 Global Protection' : `🇺🇸 Region Deal (${offer.country_code})`}
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-tight">{offer.title}</h3>
                      <p className="text-slate-450 text-xs mt-1.5 leading-relaxed font-light">{offer.description}</p>
                    </div>
                    <a
                      href={offer.target_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition duration-200 text-xs shadow-md flex items-center justify-center gap-1 active:scale-95"
                    >
                      <span>{offer.button_text || 'Get Quotes ➔'}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-12 text-slate-500 text-sm text-center mt-auto">
        <p>© {new Date().getFullYear()} ArcNester.store Architectural Studio. All rights reserved.</p>
        <p className="mt-2 text-slate-400 font-light">Engineered premium layout drawings for general contractors and building builders.</p>
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
