'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import { supabase } from '../../lib/supabaseClient';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            message: formData.message,
            status: 'unread'
          }
        ]);

      if (error) throw error;

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (err) {
      console.error("Contact Submission Error:", err);
      setErrorMsg(err.message || "Failed to submit message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 flex flex-col pb-24 md:pb-0 w-full max-w-full overflow-x-hidden">
      
      {/* Header */}
      <Header />

      {/* Main Grid Content */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 flex flex-col gap-10 overflow-x-hidden">
        <div className="text-center">
          <span className="text-amber-600 font-mono text-xs uppercase tracking-widest font-bold">Get In Touch</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-4 tracking-tight leading-tight">
            Contact Our Architectural Desk
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto font-light">
            Have questions about catalog CAD blueprints or customization layout files? Reach our support desk below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Info Card Column (4 cols) */}
          <div className="md:col-span-4 bg-slate-900 text-white p-8 rounded-3xl shadow-lg flex flex-col gap-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
            <div>
              <h3 className="text-lg font-bold">ArcNester.store Support</h3>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-light">Registered architectural services studio office headquarters.</p>
            </div>

            <div className="flex flex-col gap-5 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Email Desk</span>
                  <span className="font-mono">support@ArcNester.store.com</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Call Direct</span>
                  <span className="font-mono">+1 (800) 555-0199</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Office Address</span>
                  <span className="font-light">100 Pine Street, Suite 2400<br />San Francisco, CA 94111</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column (8 cols) */}
          <div className="md:col-span-8 bg-white border border-slate-100 p-8 sm:p-10 rounded-3xl shadow-sm flex flex-col gap-6">
            {success ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                <CheckCircle className="h-16 w-16 text-green-550 animate-bounce" />
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Message Received!</h3>
                  <p className="text-slate-450 text-xs mt-1 max-w-sm font-light">
                    Thank you! Your submission has been successfully logged. Our design engineer desk will review your message shortly.
                  </p>
                </div>
                <button
                  onClick={() => setSuccess(false)}
                  className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 text-sm font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 text-sm font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Your Message / Custom Requirement</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe size constraints, bedroom count, or architectural style adjustments you need..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 text-sm"
                  />
                </div>

                {errorMsg && <p className="text-red-500 text-xs font-semibold">{errorMsg}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl transition duration-300 text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{loading ? "Sending..." : "Submit Message Request"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-12 text-slate-500 text-sm text-center mt-auto">
        <p>© {new Date().getFullYear()} ArcNester.store Architectural Studio. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs font-semibold text-slate-400 text-center px-4">
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
