'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import { 
  ChevronLeft, 
  ChevronRight,
  Maximize2, 
  Bed, 
  Bath, 
  Calculator, 
  FileText, 
  ArrowRight, 
  Check, 
  X, 
  ShieldCheck, 
  Heart,
  Share2,
  Home,
  Layers,
  ShoppingBag,
  Pencil,
  Sparkles,
  LayoutGrid,
  Clock,
  CheckCircle,
  Zap
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

export default function PlanDetailPage({ params }) {
  const { plan_id } = params;
  
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [similarPlans, setSimilarPlans] = useState([]);
  const [otherCategoryPlans, setOtherCategoryPlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [affiliateOffer, setAffiliateOffer] = useState(null);
  
  // Interactive Estimator States
  const [finishQuality, setFinishQuality] = useState('standard'); // standard, premium, luxury
  const [selfBuild, setSelfBuild] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0);

  // Rewarded Ad States
  const [isEstimateUnlocked, setIsEstimateUnlocked] = useState(false);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [adTimeLeft, setAdTimeLeft] = useState(15);

  const startAdFlow = () => {
    setAdTimeLeft(15);
    setIsAdPlaying(true);
  };

  useEffect(() => {
    let timer;
    if (isAdPlaying && adTimeLeft > 0) {
      timer = setInterval(() => {
        setAdTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isAdPlaying && adTimeLeft === 0) {
      setIsAdPlaying(false);
      setIsEstimateUnlocked(true);
    }
    return () => clearInterval(timer);
  }, [isAdPlaying, adTimeLeft]);

  // Inquiry/Buy Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState('buy'); // buy, customize
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Buy Form States
  const [buyForm, setBuyForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Customize Form States
  const [customForm, setCustomForm] = useState({
    name: '',
    plotWidth: '',
    plotLength: '',
    facing: 'East',
    bhk: '3 BHK',
    floors: 'Duplex',
    preferences: '',
    email: '',
    phone: ''
  });

  const getImageUrl = (rawPath) => {
    if (!rawPath) return '';
    let url = rawPath;
    const r2Host = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-46ed75ab8f9c4aba937dfacb2ffb86e0.r2.dev';
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      const plansIndex = url.indexOf('plans/');
      if (plansIndex !== -1) {
        const relativePath = url.substring(plansIndex);
        url = `${r2Host}/${relativePath}`;
      } else {
        url = `${r2Host}/plans/${url.replace(/^\.?\/+/, '')}`;
      }
    } else {
      const plansIndex = url.indexOf('plans/');
      if (plansIndex !== -1) {
        url = `${r2Host}/${url.substring(plansIndex)}`;
      }
    }
    return `${url}?v=${Date.now()}`;
  };

  // Scroll handler for related carousel
  const handleScrollSimilar = (direction) => {
    const el = document.getElementById('similar-plans-carousel');
    if (el) {
      const amount = direction === 'left' ? -380 : 380;
      el.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Fetch plan detail, recommendations, and affiliate offers
  useEffect(() => {
    async function fetchPlan() {
      try {
        const { data, error } = await supabase
          .from('house_plans')
          .select('*')
          .eq('plan_id', plan_id)
          .single();

        if (error) {
          console.error("Supabase Error:", error);
          throw error;
        }
        setPlan(data);
        
        // Default select first image after sorting keys
        if (data && data.images) {
          const sortedKeys = Object.keys(data.images).sort((a, b) =>
            a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
          );
          const firstImgKey = sortedKeys[0];
          setSelectedImage(getImageUrl(data.images[firstImgKey]));
          setActiveImgIndex(0);
        }

        // Fetch similar plans and other category representatives
        if (data) {
          // 1. Fetch similar plans in same category
          const { data: similarData, error: similarError } = await supabase
            .from('house_plans')
            .select('*')
            .eq('category', data.category)
            .neq('plan_id', plan_id);

          if (!similarError) {
            let finalSimilar = similarData || [];
            if (finalSimilar.length < 2) {
              const { data: fallbackData } = await supabase
                .from('house_plans')
                .select('*')
                .eq('bedrooms', data.bedrooms || 0)
                .neq('plan_id', plan_id);
              finalSimilar = fallbackData || [];
            }
            setSimilarPlans(finalSimilar);
          }

          // 2. Fetch all plans to group other categories dynamically
          const { data: allPlans, error: allPlansError } = await supabase
            .from('house_plans')
            .select('*')
            .order('plan_id', { ascending: true });

          if (!allPlansError && allPlans) {
            // Unique categories list
            const uniqueCats = Array.from(new Set(allPlans.map((p) => p.category))).filter(Boolean);
            setCategories(uniqueCats);

            // Group representatives: take 1st plan of every other category
            const otherCatsMap = {};
            allPlans.forEach((p) => {
              if (p.category !== data.category && !otherCatsMap[p.category]) {
                otherCatsMap[p.category] = p;
              }
            });
            setOtherCategoryPlans(Object.values(otherCatsMap));
          }
        }
      } catch (err) {
        console.error('Error fetching plan details:', err);
      } finally {
        setLoading(false);
      }
    }
    
    async function fetchAffiliateOffer() {
      try {
        let country = 'GLOBAL';
        
        // DEV / TESTING MODE OVERRIDE (FOR ADMIN TESTING)
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const testCountry = params.get('test_country');
          if (testCountry) {
            country = testCountry.toUpperCase();
          } else {
            try {
              const ipRes = await fetch('https://ipapi.co/json/');
              const ipData = await ipRes.json();
              if (ipData && ipData.country_code) {
                country = ipData.country_code.toUpperCase();
              }
            } catch (e) {
              console.log("Geolocation IP lookup failed, falling back to GLOBAL:", e);
            }
          }
        }

        // Fetch matching affiliate offer from Supabase (Strict Country Filter)
        let { data: offerData, error } = await supabase
          .from('affiliate_offers')
          .select('*')
          .eq('country_code', country)
          .eq('is_active', true)
          .limit(1);

        // If no country-specific offer, fallback ONLY to GLOBAL (NO automatic US fallback)
        if ((error || !offerData || offerData.length === 0) && country !== 'GLOBAL') {
          const { data: globalData } = await supabase
            .from('affiliate_offers')
            .select('*')
            .eq('country_code', 'GLOBAL')
            .eq('is_active', true)
            .limit(1);
          offerData = globalData;
        }

        if (offerData && offerData.length > 0) {
          setAffiliateOffer(offerData[0]);
        } else {
          // STRICT RULE: Graceful hiding (no default fallback card is shown)
          setAffiliateOffer(null);
        }
      } catch (err) {
        console.error("Affiliate fetch failed:", err);
      }
    }

    fetchPlan();
    fetchAffiliateOffer();
  }, [plan_id]);

  // Client-Side Dynamic SEO Metadata Injection
  useEffect(() => {
    if (plan) {
      const pageTitle = `${plan.title} (${plan.square_footage || '1200'} Sq Ft) | Modern Architectural House Plan`;
      const pageDesc = `Explore and download complete CAD execution blueprints for ${plan.title}. Features ${plan.bedrooms || 0} Beds, ${plan.bathrooms || 0} Baths, detailed 3D renders, and construction material estimates.`;
      
      document.title = pageTitle;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', pageDesc);
    }
  }, [plan]);

  // Construction Cost Calculator Logic
  useEffect(() => {
    if (!plan) return;
    const baseRatePerSqFt = {
      standard: 120, // $120/sqft
      premium: 180,  // $180/sqft
      luxury: 270    // $270/sqft
    };
    
    const area = plan.square_footage || 1500;
    let cost = area * baseRatePerSqFt[finishQuality];
    
    if (selfBuild) {
      cost = cost * 0.85;
    }
    
    setEstimatedCost(Math.round(cost));
  }, [plan, finishQuality, selfBuild]);

  // Handle Instant Buy order logging
  const handleBuySubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    try {
      const orderPayload = {
        plan_id: plan_id,
        customer_name: buyForm.name || 'Client',
        customer_email: buyForm.email,
        customer_phone: buyForm.phone || null,
        plot_size: plan.square_footage ? `${plan.square_footage} sq ft` : null,
        requirements: 'Standard Pre-Compiled blueprint download request',
        order_type: 'INSTANT',
        status: 'pending'
      };
      await supabase.from('orders').insert([orderPayload]);
    } catch (err) {
      console.error("Error logging purchase transaction:", err);
    }

    setTimeout(() => {
      setIsModalOpen(false);
      setFormSubmitted(false);
      setBuyForm({ name: '', email: '', phone: '' });
    }, 2500);
  };

  // Handle Custom request order logging
  const handleCustomizeSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    try {
      const plotSizeStr = `${customForm.plotWidth || '0'} x ${customForm.plotLength || '0'} Ft`;
      const requirementsStr = `Facing: ${customForm.facing || 'East'}, BHK: ${customForm.bhk || '3 BHK'}, Floors: ${customForm.floors || 'Duplex'}. Custom Notes: ${customForm.preferences || 'None'}`;
      
      const orderPayload = {
        plan_id: plan_id,
        customer_name: customForm.name || 'Client',
        customer_email: customForm.email,
        customer_phone: customForm.phone || null,
        plot_size: plotSizeStr,
        requirements: requirementsStr,
        order_type: 'CUSTOM',
        status: 'pending'
      };
      await supabase.from('orders').insert([orderPayload]);
    } catch (err) {
      console.error("Error logging customization transaction:", err);
    }

    setTimeout(() => {
      setIsModalOpen(false);
      setFormSubmitted(false);
      setCustomForm({
        name: '',
        plotWidth: '',
        plotLength: '',
        facing: 'East',
        bhk: '3 BHK',
        floors: 'Duplex',
        preferences: '',
        email: '',
        phone: ''
      });
    }, 2500);
  };


  const openModal = (type) => {
    setInquiryType(type);
    setIsModalOpen(true);
  };

  // Construct JSON-LD Schema Markup safely
  const schemaMarkup = plan ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": plan.title,
    "image": Object.values(plan.images || {}).map(getImageUrl),
    "description": plan.short_description || plan.blog_content,
    "sku": plan.plan_id,
    "offers": {
      "@type": "Offer",
      "price": estimatedCost,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  } : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Plan Package Not Found</h2>
        <p className="text-slate-500 mb-6">The requested plan ID ({plan_id}) could not be resolved.</p>
        <Link href="/" className="bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition hover:bg-amber-400 inline-block text-center">
          Back to Catalog
        </Link>
      </div>
    );
  }

  // Dynamic Material Estimates Calculation
  const baseArea = plan.square_footage || 1000;
  const calcPlotSize = plan.technical_specifications?.plot_size || "30' x 40'";
  const calcCement = Math.round(baseArea * 0.40);
  const calcSteel = ((baseArea * 1.8) / 1000).toFixed(2);
  const calcBricks = Math.round(baseArea * 9);

  const sortedImageKeys = plan && plan.images ? Object.keys(plan.images).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })) : [];
  const sortedImageUrls = sortedImageKeys.map(key => getImageUrl(plan.images[key]));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col pb-24 md:pb-0 w-full max-w-full overflow-x-hidden">
      
      {/* JSON-LD Schema Script Injection */}
      {schemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
      )}

      {/* Header */}
      <Header />

      {/* TOP CATEGORY ANCHORS */}
      {categories.length > 0 && (
        <div className="bg-white border-b border-slate-100 py-3.5 sticky top-20 z-40 shadow-sm overflow-x-auto no-scrollbar whitespace-nowrap" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-slate-455 uppercase tracking-wider shrink-0 mr-2">Jump to category:</span>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/?category=${cat}`}
                className="px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition shrink-0"
              >
                {cat.replace(/_/g, ' ')}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col gap-16 overflow-x-hidden">
        
        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Primary Content Stream (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* Main Showcase Image Card */}
            <div className="bg-white border border-slate-100 p-3 rounded-3xl shadow-sm relative aspect-[4/3] overflow-hidden">
              <img
                src={selectedImage}
                alt={`${plan.title} - Main 3D Exterior Render View`}
                draggable="false"
                onError={(e) => {
                  e.target.onError = null;
                  e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='%23f1f5f9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%2394a3b8'>Render Unavailable</text></svg>";
                }}
                className="w-full h-full object-cover rounded-2xl select-none"
              />
              
              {/* Repeating Diagonal Watermark Shield */}
              <div 
                className="absolute inset-0 pointer-events-none select-none z-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='100' viewBox='0 0 160 100'><text x='50%' y='50%' fill='rgba(255,255,255,0.06)' font-size='10' font-weight='bold' font-family='sans-serif' text-anchor='middle' transform='rotate(-25 80 50)'>ArcNester.store</text></svg>")`,
                  backgroundRepeat: 'repeat',
                  margin: '12px',
                  borderRadius: '16px'
                }}
              />

              {/* Central Elegant Diagonal Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20">
                <span className="text-white/40 text-lg md:text-3xl font-extrabold tracking-widest uppercase transform -rotate-30 select-none pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                  ArcNester.store
                </span>
              </div>
              

              
              <div className="absolute bottom-6 right-6 flex gap-2 z-30">
                <button 
                  onClick={() => setIsSaved(!isSaved)}
                  className="h-10 w-10 rounded-full bg-white/90 backdrop-blur border border-slate-200 flex items-center justify-center text-slate-655 hover:text-red-500 hover:scale-105 active:scale-95 transition"
                >
                  <Heart className={`h-5 w-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
                <button className="h-10 w-10 rounded-full bg-white/90 backdrop-blur border border-slate-200 flex items-center justify-center text-slate-655 hover:text-slate-900 hover:scale-105 active:scale-95 transition">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Sorted Gallery Thumbnails Grid */}
            <div className="grid grid-cols-6 gap-3">
              {plan.images && Object.keys(plan.images)
                .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
                .map((key, idx) => {
                  const url = getImageUrl(plan.images[key]);
                  const isSelected = selectedImage === url;
                  
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedImage(url);
                        setActiveImgIndex(idx);
                        const el = document.getElementById(`showcase-slide-${idx}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                      }}
                      onContextMenu={(e) => e.preventDefault()}
                      className={`aspect-square rounded-2xl overflow-hidden bg-slate-100 border-2 transition duration-200 p-0.5 relative block group ${
                        isSelected ? 'border-amber-500 scale-95 shadow-md' : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`${plan.title} 3D Exterior Render - Image ${idx + 1}`}
                        draggable="false"
                        onError={(e) => {
                          e.target.onError = null;
                          e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%' height='100%' fill='%23e2e8f0'/></svg>";
                        }}
                        className="w-full h-full object-cover rounded-xl select-none"
                      />
                      
                      {/* Repeating Diagonal Watermark Shield */}
                      <div 
                        className="absolute inset-0 pointer-events-none select-none z-10"
                        style={{
                          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='100' viewBox='0 0 160 100'><text x='50%' y='50%' fill='rgba(255,255,255,0.06)' font-size='10' font-weight='bold' font-family='sans-serif' text-anchor='middle' transform='rotate(-25 80 50)'>ArcNester.store</text></svg>")`,
                          backgroundRepeat: 'repeat',
                          margin: '2px',
                          borderRadius: '10px'
                        }}
                      />
                    </button>
                  );
                })}
            </div>

            {/* PRODUCT ACTION BUTTONS (Directly Below Image Thumbnails Gallery) */}
            <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Purchase & Customization Studio</h3>
                <p className="text-slate-400 text-xs mt-1">Ready-to-execute architectural blueprints and customizable layout variations</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => openModal('buy')}
                  className="flex items-center justify-center gap-2.5 py-4 bg-amber-500 hover:bg-amber-455 text-slate-950 font-extrabold rounded-2xl transition duration-300 text-sm shadow-md"
                >
                  <ShoppingBag className="h-4.5 w-4.5" />
                  <span>Buy Complete Plan Package</span>
                </button>

                <button
                  onClick={() => openModal('customize')}
                  className="flex items-center justify-center gap-2.5 py-4 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-2xl transition duration-300 text-xs"
                >
                  <Pencil className="h-4 w-4 text-slate-500" />
                  <span>Request Customization</span>
                </button>
              </div>
            </div>

            {/* Package Inclusions & Architectural Specifications */}
            <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
              <h3 className="text-lg font-extrabold text-slate-900 mb-4 tracking-tight">Package Inclusions & Specifications</h3>
              <div className="flex flex-col gap-4 text-sm text-slate-655">
                <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-slate-900">Included Execution Blueprints</span>
                    <span className="text-xs font-light block mt-0.5">Complete CAD working blueprints, foundation details, column spacing grids, detailed structural beam plans, and plumbing/electrical flow schematics.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <LayoutGrid className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-slate-900">Architectural Style Category</span>
                    <span className="text-xs font-light block mt-0.5">Design styled under {plan.category?.replace(/_/g, ' ').toUpperCase() || 'Modern Contemporary'} design specifications.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <Maximize2 className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-slate-900">Estimated Building Footprint</span>
                    <span className="text-xs font-light block mt-0.5">Optimized for compact/medium layout land boundaries and standard municipal set-backs.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Concept & Description Block */}
            <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Architectural Briefing</h2>
              </div>
              <div className="text-slate-550 font-light leading-relaxed whitespace-pre-line text-base">
                {plan.blog_content || plan.short_description}
              </div>
            </div>

            {/* Spatial Flow from SEO Data */}
            {plan.seo_data?.spatial_layout_breakdown && (
              <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Spatial Layout Flow</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plan.seo_data.spatial_layout_breakdown.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-655">
                      <div className="h-6 w-6 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 text-xs shrink-0 font-extrabold mt-0.5">
                        {idx + 1}
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          {/* Right Column: Spec Sheet, Cost Estimator & Affiliate offers (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Main Title & ID Card */}
            <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-sm">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
                {plan.plan_id}
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-4 leading-tight">
                {plan.title}
              </h1>
              
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <div>
                  <span className="block text-[10px] text-slate-450 uppercase tracking-wider mb-1 font-bold">Square Feet</span>
                  <span className="text-base font-extrabold text-slate-800">{plan.square_footage || 0}</span>
                </div>
                <div className="border-x border-slate-200">
                  <span className="block text-[10px] text-slate-455 uppercase tracking-wider mb-1 font-bold">Bedrooms</span>
                  <span className="text-base font-extrabold text-slate-800">{plan.bedrooms || 0} BHK</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-455 uppercase tracking-wider mb-1 font-bold">Bathrooms</span>
                  <span className="text-base font-extrabold text-slate-800">{plan.bathrooms || 0}</span>
                </div>
              </div>
            </div>

            {/* Technical Specs Sheet */}
            <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
              {isEstimateUnlocked && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 w-fit">
                  <CheckCircle className="h-4 w-4" />
                  <span>✅ Material & Cost Calculations Unlocked</span>
                </div>
              )}
              
              <h3 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Material Bill Summary</h3>
              <div className="divide-y divide-slate-50 text-sm">
                <div className="py-3 flex justify-between">
                  <span className="text-slate-455">Plot Dimensions</span>
                  <span className="text-slate-800 font-bold">{calcPlotSize}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-455">Built-Up Area</span>
                  <span className="text-slate-800 font-bold">{baseArea} Sq. Ft.</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-455">Cement Required</span>
                  <span className={`text-slate-800 font-bold ${isEstimateUnlocked ? '' : 'blur-sm select-none'}`}>
                    {isEstimateUnlocked ? `${calcCement} Bags` : '•••• Bags'}
                  </span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-455">Steel Required</span>
                  <span className={`text-slate-800 font-bold ${isEstimateUnlocked ? '' : 'blur-sm select-none'}`}>
                    {isEstimateUnlocked ? `${calcSteel} Tons` : '•••• Tons'}
                  </span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-455">Bricks Required</span>
                  <span className={`text-slate-800 font-bold ${isEstimateUnlocked ? '' : 'blur-sm select-none'}`}>
                    {isEstimateUnlocked ? `${calcBricks.toLocaleString()} Blocks` : '•••• Blocks'}
                  </span>
                </div>
              </div>

              {!isEstimateUnlocked && (
                <div className="mt-5 pt-4 border-t border-slate-50 flex flex-col gap-2 text-center">
                  <button
                    type="button"
                    onClick={startAdFlow}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <span>🔓 Unlock Full Material Bill & Cost Breakdown</span>
                  </button>
                  <span className="text-[10px] text-slate-400 font-light block">
                    Sponsored Feature • Watch a short 15-sec video ad to calculate and reveal exact quantities.
                  </span>
                </div>
              )}
            </div>

            {/* Dynamic Geo-Affiliate Offer Widget (GeoLeadCard) */}
            {affiliateOffer && (
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-300/5 border border-amber-500/20 p-6 rounded-3xl shadow-sm flex flex-col gap-3.5 relative overflow-hidden">
                {/* Geolocation Tag Badge */}
                <div className="flex">
                  <span className="text-[9px] font-extrabold text-amber-700 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                    {affiliateOffer.country_code === 'US' && "🇺🇸 USA Exclusive Offer"}
                    {affiliateOffer.country_code === 'IN' && "🇮🇳 India Exclusive Offer"}
                    {affiliateOffer.country_code === 'GB' && "🇬🇧 UK Exclusive Offer"}
                    {affiliateOffer.country_code === 'CA' && "🇨🇦 Canada Exclusive Offer"}
                    {affiliateOffer.country_code !== 'US' && affiliateOffer.country_code !== 'IN' && affiliateOffer.country_code !== 'GB' && affiliateOffer.country_code !== 'CA' && "🌐 Verified Partner Deal"}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight leading-snug">
                    {affiliateOffer.title}
                  </h3>
                  <p className="text-slate-500 text-[11px] font-light leading-relaxed line-clamp-2">
                    {affiliateOffer.description}
                  </p>
                </div>

                <a 
                  href={affiliateOffer.affiliate_url || affiliateOffer.target_link || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-1"
                >
                  <button className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition duration-300 text-xs shadow-md flex items-center justify-center gap-1.5">
                    <span>{affiliateOffer.button_text || affiliateOffer.button_label || 'Learn More'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </a>
              </div>
            )}

            {/* Interactive Cost Estimator Widget */}
            <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
              {isEstimateUnlocked && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 w-fit">
                  <CheckCircle className="h-4 w-4" />
                  <span>✅ Material & Cost Calculations Unlocked</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Construction Cost Estimator</h3>
              </div>
              
              <div className="flex flex-col gap-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-455 uppercase tracking-wider mb-2">Build Finish Grade</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['standard', 'premium', 'luxury'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => {
                          if (isEstimateUnlocked) {
                            setFinishQuality(lvl);
                          } else {
                            startAdFlow();
                          }
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase transition duration-200 ${
                          finishQuality === lvl
                            ? 'bg-amber-500 text-white border-transparent shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-555 hover:bg-slate-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-slate-655 text-xs font-medium">Self-Build / General Contractor discount</span>
                  <input
                    type="checkbox"
                    disabled={!isEstimateUnlocked}
                    checked={selfBuild}
                    onChange={(e) => {
                      if (isEstimateUnlocked) {
                        setSelfBuild(e.target.checked);
                      } else {
                        startAdFlow();
                      }
                    }}
                    className="accent-amber-500 h-4 w-4 cursor-pointer disabled:opacity-50"
                  />
                </div>

                <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/40 text-center mt-2 relative overflow-hidden">
                  <span className="text-xs text-amber-800 block uppercase tracking-wider mb-1 font-bold">Estimated Cost Index</span>
                  <span className={`text-3xl font-extrabold text-amber-600 block ${isEstimateUnlocked ? '' : 'blur-md select-none'}`}>
                    {isEstimateUnlocked ? `$${estimatedCost.toLocaleString()}` : '$••••••'}
                  </span>
                  
                  {!isEstimateUnlocked && (
                    <div className="absolute inset-0 bg-amber-50/10 backdrop-blur-[2px] flex items-center justify-center">
                      <button
                        type="button"
                        onClick={startAdFlow}
                        className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition active:scale-95 shadow-md flex items-center gap-1"
                      >
                        <span>🔓 Unlock Estimate</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Design Action inquiry card */}
            <div className="bg-slate-900 border border-slate-855 p-6 sm:p-8 rounded-3xl shadow-md flex flex-col gap-4 text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-500 animate-pulse" />
                <h3 className="text-base font-bold">Execution Ready Blueprint</h3>
              </div>
              <p className="text-slate-400 text-xs font-light leading-relaxed">
                ArcNester.store blueprint sets include full column footing outlines, structural load calculations, and raw bills of materials for construction bids.
              </p>
            </div>
          </div>

        </div>

        {/* RELATED PLANS CATEGORY HORIZONTAL CAROUSEL SECTION */}
        {similarPlans.length > 0 && (
          <div className="border-t border-slate-100 pt-12 flex flex-col gap-6">
            
            {/* Header with Slider Navigation */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  More in {plan.category?.replace(/_/g, ' ').toUpperCase()}
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  {similarPlans.length} Plans Available in Category
                </p>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleScrollSimilar('left')}
                  className="h-9 w-9 rounded-full bg-white border border-slate-200 text-slate-655 flex items-center justify-center hover:bg-slate-50 transition active:scale-95 shadow-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleScrollSimilar('right')}
                  className="h-9 w-9 rounded-full bg-white border border-slate-200 text-slate-655 flex items-center justify-center hover:bg-slate-50 transition active:scale-95 shadow-sm"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Carousel Container */}
            <div
              id="similar-plans-carousel"
              className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory touch-pan-y"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-y' }}
            >
              {similarPlans.map((simPlan) => {
                const simImage = getImageUrl(simPlan.images?.['01_exterior_front_elevation']) || '/placeholder.jpg';

                return (
                  <div
                    key={simPlan.plan_id}
                    className="snap-start shrink-0 w-full max-w-[calc(100vw-2rem)] sm:w-[320px] md:w-[350px] mx-auto bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Image Preview with Hover Zoom */}
                    <Link
                      href={`/plans/${simPlan.plan_id}`}
                      className="block relative aspect-[4/3] overflow-hidden bg-slate-100 group pointer-events-auto cursor-pointer"
                    >
                      <img
                        src={simImage}
                        alt={`${simPlan.title} 3D Exterior Render View`}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onError = null;
                          e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='%23f1f5f9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%2394a3b8'>Render Unavailable</text></svg>";
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      
                      {/* Category Pill */}
                      <div className="absolute top-3.5 left-3.5 bg-white/90 backdrop-blur text-slate-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-slate-100 tracking-wider uppercase pointer-events-none">
                        {simPlan.category?.replace(/_/g, ' ')}
                      </div>
                    </Link>

                    {/* Details card content */}
                    <div className="p-5 flex flex-col flex-1 justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
                          {simPlan.plan_id}
                        </span>
                        
                        <Link href={`/plans/${simPlan.plan_id}`} className="cursor-pointer block">
                          <h3 className="text-base font-extrabold text-slate-900 line-clamp-1 leading-snug hover:text-amber-500 transition">
                            {simPlan.title}
                          </h3>
                        </Link>
                        
                        <p className="text-slate-455 text-xs font-light mt-2 line-clamp-2 leading-relaxed">
                          {simPlan.short_description || simPlan.blog_content}
                        </p>
                      </div>

                      {/* Metadata Specs Badges */}
                      <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Maximize2 className="h-3.5 w-3.5 text-amber-500" />
                          <span className="font-bold text-slate-700">{simPlan.square_footage || 0}</span> sq ft
                        </div>
                        <div className="flex items-center gap-1">
                          <Bed className="h-3.5 w-3.5 text-amber-500" />
                          <span className="font-bold text-slate-700">{simPlan.bedrooms || 0}</span> BHK
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-3.5 w-3.5 text-amber-500" />
                          <span className="font-bold text-slate-700">{simPlan.bathrooms || 0}</span> Bath
                        </div>
                      </div>

                      {/* CTA Action button */}
                      <div className="mt-5">
                        <Link href={`/plans/${simPlan.plan_id}`}>
                          <button className="w-full py-2.5 bg-slate-50 hover:bg-amber-500 hover:text-white border border-slate-200 hover:border-transparent font-bold text-slate-700 rounded-xl transition duration-300 text-xs flex items-center justify-center gap-1">
                            <span>View Plan Details</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </Link>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* EXPLORE OTHER CATEGORIES SHOWCASE ROW (Bottom) */}
        {otherCategoryPlans.length > 0 && (
          <div className="border-t border-slate-100 pt-12 flex flex-col gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Explore Other Architectural Styles</h2>
              <p className="text-slate-400 text-xs mt-1">Discover design concepts from different styles</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {otherCategoryPlans.map((othPlan) => {
                const othImage = getImageUrl(othPlan.images?.['01_exterior_front_elevation']) || '/placeholder.jpg';
                return (
                  <div
                    key={othPlan.plan_id}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    <Link
                      href={`/plans/${othPlan.plan_id}`}
                      className="block relative aspect-[4/3] overflow-hidden bg-slate-100 group pointer-events-auto cursor-pointer"
                    >
                      <img
                        src={othImage}
                        alt={`${othPlan.title} 3D Exterior Render View`}
                        onError={(e) => {
                          e.target.onError = null;
                          e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='%23f1f5f9'/></svg>";
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider pointer-events-none">
                        {othPlan.category?.replace(/_/g, ' ')}
                      </div>
                    </Link>

                    <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                      <div>
                        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mb-0.5">
                          {othPlan.plan_id}
                        </span>
                        <Link href={`/plans/${othPlan.plan_id}`} className="cursor-pointer block">
                          <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1 hover:text-amber-500 transition">
                            {othPlan.title}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-2">
                          <span className="font-semibold text-slate-700">{othPlan.square_footage || 0} sqft</span>
                          <span className="text-slate-300">|</span>
                          <span className="font-semibold text-slate-700">{othPlan.bedrooms || 0} BHK</span>
                        </div>
                      </div>

                      <Link href={`/plans/${othPlan.plan_id}`}>
                        <button className="w-full py-2 bg-slate-50 hover:bg-amber-500 hover:text-white border border-slate-155 hover:border-transparent font-bold text-slate-650 rounded-xl transition text-[11px]">
                          Explore Style
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* MOBILE STICKY BOTTOM ACTION BAR (md:hidden) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-3.5 px-4 flex gap-3 z-50 shadow-[0_-6px_20px_rgba(0,0,0,0.06)]">
        <button
          onClick={() => openModal('customize')}
          className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
        >
          <Pencil className="h-4 w-4 text-slate-500" />
          <span>Customize</span>
        </button>
        
        <button
          onClick={() => openModal('buy')}
          className="flex-1 py-3 bg-amber-500 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition shadow-sm"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Buy blueprints</span>
        </button>
      </div>

      {/* DUAL MODAL SYSTEM (Buy & Customization) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur p-4 overflow-y-auto">
          <div className="bg-white border border-slate-100 w-full max-w-lg rounded-3xl p-6 sm:p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
            
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition"
            >
              <X className="h-6 w-6" />
            </button>

            {formSubmitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 bg-green-50 rounded-full border border-green-100 flex items-center justify-center text-green-500 mb-4 animate-bounce">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Request Received!
                </h3>
                <p className="text-slate-500 text-sm mt-2 max-w-xs leading-relaxed">
                  Request received! The complete architectural PDF package will be emailed to you shortly after architect review.
                </p>
              </div>
            ) : (
              <>
                {/* 1. INSTANT BUY MODAL LAYOUT */}
                {inquiryType === 'buy' && (
                  <form onSubmit={handleBuySubmit} className="flex flex-col gap-5">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Download Instant Execution Package</h3>
                      <span className="text-xs font-mono text-slate-450 mt-1 block">Plan ID Reference: {plan_id}</span>
                      
                      {/* Price Display Section */}
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-sm text-slate-400 line-through font-medium">$7.99</span>
                        <span className="text-2xl font-black text-slate-900">$4.99</span>
                        <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          🔥 38% OFF - Limited Time Offer
                        </span>
                      </div>
                      
                      {/* Savings Banner */}
                      <div className="mt-2 text-xs font-bold text-green-755 bg-green-50 border border-green-200/50 py-1.5 px-3 rounded-xl inline-block">
                        🎉 You Save $3.00 today!
                      </div>
                    </div>

                    {/* Transparency checklist */}
                    <div className="bg-amber-50/50 border border-amber-200/40 p-4.5 rounded-2xl flex flex-col gap-3">
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">What You Will Receive Instantly</span>
                      <ul className="text-slate-655 text-xs flex flex-col gap-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-amber-500 shrink-0" />
                          <span>Pre-compiled CAD Blueprints & color schematics.</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-amber-500 shrink-0" />
                          <span>Exact Brick, Cement & Steel formula estimations.</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-amber-500 shrink-0" />
                          <span>Electrical & plumbing conduit path layout designs.</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-amber-500 shrink-0" />
                          <span>Home Loan documentation & building sourcing directory.</span>
                        </li>
                      </ul>
                    </div>

                    {/* Inputs */}
                    <div className="flex flex-col gap-3.5">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          required
                          value={buyForm.name}
                          onChange={(e) => setBuyForm({ ...buyForm, name: e.target.value })}
                          className="px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                          <input
                            type="email"
                            required
                            value={buyForm.email}
                            onChange={(e) => setBuyForm({ ...buyForm, email: e.target.value })}
                            className="px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile Number</label>
                          <input
                            type="tel"
                            required
                            value={buyForm.phone}
                            onChange={(e) => setBuyForm({ ...buyForm, phone: e.target.value })}
                            className="px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl transition duration-300 text-sm shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="h-4.5 w-4.5" />
                      <span>Pay $4.99 & Get Instant Download</span>
                    </button>
                  </form>
                )}

                {/* 2. CUSTOMIZATION FORM MODAL */}
                {inquiryType === 'customize' && (
                  <form onSubmit={handleCustomizeSubmit} className="flex flex-col gap-4 max-h-[85vh] overflow-y-auto pr-1">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Custom AI Architectural Request</h3>
                      <span className="text-xs font-mono text-slate-455 mt-1 block">Modifying Design Reference: {plan_id}</span>
                      
                      {/* Price Display Section */}
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-sm text-slate-400 line-through font-medium">$14.99</span>
                        <span className="text-2xl font-black text-slate-900">$9.99</span>
                        <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          🔥 33% OFF - Special Customization Deal
                        </span>
                      </div>
                      
                      {/* Savings Banner */}
                      <div className="mt-2 text-xs font-bold text-green-755 bg-green-50 border border-green-200/50 py-1.5 px-3 rounded-xl inline-block">
                        🎉 You Save $5.00 today!
                      </div>
                    </div>

                    {/* SLA Notice Banner */}
                    <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-2.5 text-white">
                      <Clock className="h-5 w-5 text-amber-500 shrink-0" />
                      <div className="text-xs">
                        <span className="block font-bold">⚡ Delivery Time: Within 12 Hours via Email</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Delivered as editable CAD + PDF formats to your inbox.</span>
                      </div>
                    </div>

                    {/* Transparency Section */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2 text-xs">
                      <span className="font-bold text-slate-800 uppercase tracking-wider block">What's Included in Custom Package</span>
                      <ul className="text-slate-600 flex flex-col gap-1.5 list-disc pl-4.5">
                        <li>2-3 High-Res AI 3D Exterior Elevations matching your custom aesthetic.</li>
                        <li>2D Conceptual room configuration blueprints adjusted to your exact boundaries.</li>
                        <li>Dynamic civil blueprint calculations and bill of materials projections.</li>
                      </ul>
                    </div>

                    {/* Client Name Input */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Doe"
                        value={customForm.name}
                        onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                        className="px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs font-semibold"
                      />
                    </div>

                    {/* Custom Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plot Width (Ft)</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 30"
                          value={customForm.plotWidth}
                          onChange={(e) => setCustomForm({ ...customForm, plotWidth: e.target.value })}
                          className="px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plot Length (Ft)</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 40"
                          value={customForm.plotLength}
                          onChange={(e) => setCustomForm({ ...customForm, plotLength: e.target.value })}
                          className="px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Facing Direction</label>
                        <select
                          value={customForm.facing}
                          onChange={(e) => setCustomForm({ ...customForm, facing: e.target.value })}
                          className="px-3 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs"
                        >
                          <option>East</option>
                          <option>North</option>
                          <option>West</option>
                          <option>South</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">BHK Selection</label>
                        <select
                          value={customForm.bhk}
                          onChange={(e) => setCustomForm({ ...customForm, bhk: e.target.value })}
                          className="px-3 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs"
                        >
                          <option>1 BHK</option>
                          <option>2 BHK</option>
                          <option>3 BHK</option>
                          <option>4 BHK</option>
                          <option>5+ BHK</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Floors Grade</label>
                        <select
                          value={customForm.floors}
                          onChange={(e) => setCustomForm({ ...customForm, floors: e.target.value })}
                          className="px-3 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs"
                        >
                          <option>Single Story</option>
                          <option>Duplex</option>
                          <option>Triplex</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Special Requests / Preferences</label>
                      <textarea
                        rows={2}
                        placeholder="Describe preferences (e.g. want pool, open garage path, modular styling)..."
                        value={customForm.preferences}
                        onChange={(e) => setCustomForm({ ...customForm, preferences: e.target.value })}
                        className="px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 placeholder-slate-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                        <input
                          type="email"
                          required
                          value={customForm.email}
                          onChange={(e) => setCustomForm({ ...customForm, email: e.target.value })}
                          className="px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mobile Number</label>
                        <input
                          type="tel"
                          required
                          value={customForm.phone}
                          onChange={(e) => setCustomForm({ ...customForm, phone: e.target.value })}
                          className="px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl transition duration-300 text-sm shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
                    >
                      <Zap className="h-4.5 w-4.5" />
                      <span>Pay $9.99 & Request Custom Plan</span>
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Sponsored calculation reward ad modal */}
      {isAdPlaying && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-3xl p-6 sm:p-8 relative shadow-2xl text-center flex flex-col items-center justify-center gap-6">
            
            {/* Visual Header */}
            <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 animate-spin duration-3000">
              <Zap className="h-7 w-7 animate-pulse" />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono text-amber-655 uppercase tracking-widest block font-bold">
                Sponsored Partner Feature
              </span>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Calculating Architectural Quantities & Cost Estimates
              </h3>
              <p className="text-slate-450 text-[11px] font-light leading-relaxed">
                Loading database estimates for Plan ID: <span className="font-mono text-slate-800 font-bold">{plan_id}</span>. Please wait while calculation completes.
              </p>
            </div>

            {/* Countdown visual */}
            <div className="bg-slate-900 border border-slate-800 text-white font-mono py-4 px-6 rounded-2xl w-full flex items-center justify-center gap-3">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              <span className="text-xs font-bold">
                Calculating... {adTimeLeft}s remaining
              </span>
            </div>

            {/* Cancel option */}
            <button
              type="button"
              onClick={() => setIsAdPlaying(false)}
              className="text-[10px] text-slate-400 hover:text-slate-655 transition font-medium"
            >
              Cancel Ad (Calculations will remain locked)
            </button>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-12 text-slate-500 text-sm text-center">
        <p>© {new Date().getFullYear()} ArcNester.store Architectural Studio. All rights reserved.</p>
        <p className="mt-2 text-slate-400 font-light">Engineered premium layout drawings for general contractors and building builders.</p>
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
