'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Bed, 
  Bath, 
  Maximize2, 
  Home as HomeIcon, 
  Layers, 
  Heart, 
  ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const getFallbackImage = (planId) => {
  const fallbacks = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
  ];
  if (!planId) return fallbacks[0];
  let hash = 0;
  for (let i = 0; i < planId.length; i++) {
    hash += planId.charCodeAt(i);
  }
  return fallbacks[hash % fallbacks.length];
};

export default function Home() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState('All');

  // 3D Parallax Mouse Tracking State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left - width / 2) / (width / 2); // -1 to 1
    const y = (clientY - top - height / 2) / (height / 2); // -1 to 1
    setMousePos({ x, y });
  };
  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Fetch plans from Supabase on mount
  useEffect(() => {
    async function fetchPlans() {
      try {
        let { data, error } = await supabase
          .from('house_plans')
          .select('*')
          .eq('is_published', true)
          .lte('published_at', new Date().toISOString())
          .order('plan_id', { ascending: true });

        // Backward compatibility fallback in case schema has not been updated yet
        if (error && (error.message.includes('column') || error.code === 'PGRST204')) {
          console.log("Publishing columns not found, falling back to full plans fetch...");
          const fallbackRes = await supabase
            .from('house_plans')
            .select('*')
            .order('plan_id', { ascending: true });
          data = fallbackRes.data;
          error = fallbackRes.error;
        }

        if (error) {
          console.error("Supabase Error:", error);
          throw error;
        }
        
        let counter1bhk = 0;
        const mapped = (data || []).map(p => {
          let categoryId = '1bhk';
          const cat = p.category?.toLowerCase() || '';
          if (cat.includes('1bhk') || cat.includes('tiny')) categoryId = '1bhk';
          else if (cat.includes('2bhk')) categoryId = '2bhk';
          else if (cat.includes('3bhk')) categoryId = '3bhk';
          else if (cat.includes('villa') || cat.includes('duplex') || cat.includes('luxury') || cat.includes('spanish') || cat.includes('haveli')) categoryId = 'villas';
          else if (cat.includes('farm') || cat.includes('barn') || cat.includes('ranch') || cat.includes('a_frame')) categoryId = 'farmhouse';
          else categoryId = p.category || '1bhk';

          let isPub = false;
          if (categoryId === '1bhk' && counter1bhk < 10) {
            isPub = true;
            counter1bhk++;
          }
          return {
            ...p,
            category_id: categoryId,
            isPublished: isPub
          };
        });
        setPlans(mapped);
      } catch (err) {
        console.error('Error fetching plans:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const getImageUrl = (rawPath, plan) => {
    let path = rawPath;
    
    if (!path && plan) {
      if (typeof plan.images === 'string') {
        path = plan.images;
      } else if (Array.isArray(plan.images)) {
        path = plan.images[0];
      } else if (plan.images && typeof plan.images === 'object') {
        path = plan.images['01_exterior_front_elevation'] || Object.values(plan.images)[0];
      }
      if (!path) {
        path = plan.image_url || plan.image || plan.cover_image || plan.render_url || plan.raw_json?.images?.['01_exterior_front_elevation'];
      }
    }

    if (!path) {
      return getFallbackImage(plan?.plan_id);
    }


    let url = path;
    const r2Host = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-46ed75ab8f9c4aba937dfacb2ffb86e0.r2.dev';
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      const parts = url.replace(/\\/g, '/').split('/');
      const planIdIndex = parts.findIndex(p => p.startsWith('plan_') || p.match(/^plan\d+$/i));
      
      if (planIdIndex !== -1 && planIdIndex > 0) {
        const category = parts[planIdIndex - 1];
        const planId = parts[planIdIndex];
        const imgName = parts[parts.length - 1];
        url = `${r2Host}/plans/${category}/${planId}/${imgName}`;
      } else if (plan && plan.category && plan.plan_id) {
        const imgName = parts[parts.length - 1];
        url = `${r2Host}/plans/${plan.category}/${plan.plan_id}/${imgName}`;
      } else {
        const plansIndex = url.indexOf('plans/');
        if (plansIndex !== -1) {
          const relativePath = url.substring(plansIndex);
          url = `${r2Host}/${relativePath}`;
        } else {
          url = `${r2Host}/plans/${url.replace(/^\.?\/+/, '')}`;
        }
      }
    } else {
      const plansIndex = url.indexOf('plans/');
      if (plansIndex !== -1) {
        url = `${r2Host}/${url.substring(plansIndex)}`;
      }
    }
    
    return `${url}?v=${Date.now()}`;
  };

  // Scroll handler for carousels
  const handleScroll = (id, direction) => {
    const el = document.getElementById(id);
    if (el) {
      const amount = direction === 'left' ? -380 : 380;
      el.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Smart flexible search matcher
  const matchPlan = (plan, query) => {
    if (!query) return true;
    
    const normalizedQuery = query.toLowerCase().replace(/\s+/g, '');
    
    // Check BHK query variations
    const is1bhk = normalizedQuery.includes('1bhk') || normalizedQuery.includes('1bed') || normalizedQuery.includes('1b');
    const is2bhk = normalizedQuery.includes('2bhk') || normalizedQuery.includes('2bed') || normalizedQuery.includes('2b');
    const is3bhk = normalizedQuery.includes('3bhk') || normalizedQuery.includes('3bed') || normalizedQuery.includes('3b') || normalizedQuery.includes('3+bhk');
    
    const bedrooms = plan.bedrooms || 0;
    
    if (is1bhk && bedrooms === 1) return true;
    if (is2bhk && bedrooms === 2) return true;
    if (is3bhk && bedrooms >= 3) return true;
    
    // Match numeric area values
    const builtUp = (plan.technical_specifications?.built_up_area || '').toLowerCase();
    const sqft = String(plan.square_footage || '');
    if (normalizedQuery.match(/^\d+$/)) {
      if (sqft.includes(normalizedQuery) || builtUp.includes(normalizedQuery)) {
        return true;
      }
    }
    
    // Base string matcher
    const title = (plan.title || '').toLowerCase().replace(/\s+/g, '');
    const category = (plan.category || '').toLowerCase().replace(/\s+/g, '');
    const desc = (plan.short_description || plan.blog_content || '').toLowerCase().replace(/\s+/g, '');
    
    const combinedText = `${title}${category}${desc}`;
    return combinedText.includes(normalizedQuery);
  };

  // Filter plans based on search bar
  const getFilteredList = (categoryType) => {
    let list = plans.filter(p => p.isPublished);

    // Apply smart flexible search query
    if (searchQuery.trim()) {
      list = list.filter((p) => matchPlan(p, searchQuery));
    }

    // Now filter by the category-wise slide groups
    if (categoryType === 'featured') {
      return list.slice(0, 12);
    } else if (categoryType === '1bhk') {
      return list.filter((p) => p.category_id === '1bhk');
    } else if (categoryType === '2bhk_3bhk') {
      return list.filter((p) => p.category_id === '2bhk' || p.category_id === '3bhk');
    } else if (categoryType === 'villas_duplex') {
      return list.filter((p) => p.category_id === 'villas');
    } else if (categoryType === 'farmhouse_barn') {
      return list.filter((p) => p.category_id === 'farmhouse');
    }

    return list;
  };

  const featuredList = getFilteredList('featured');
  const b1hkList = getFilteredList('1bhk');
  const b2hk3hkList = getFilteredList('2bhk_3bhk');
  const villasList = getFilteredList('villas_duplex');
  const farmhouseList = getFilteredList('farmhouse_barn');

  const handleViewAll = (categoryType) => {
    if (categoryType === 'featured') {
      setActiveChip('All');
      const el = document.getElementById('search-bar-container');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveChip(categoryType);
      const el = document.getElementById('category-slider');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dynamic filtering logic
  const displayedPlans = activeChip === 'All'
    ? plans.filter(p => p.isPublished)
    : plans.filter(p => p.category_id === activeChip && p.isPublished);


  // Static list of all available categories
  const categoriesList = [
    'All',
    '1bhk',
    '2bhk',
    '3bhk',
    'villas',
    'farmhouse'
  ];

  const formatCategoryName = (cat) => {
    if (!cat) return '';
    if (cat === 'All') return 'All Designs';
    return cat
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace(/1bhk/i, '1 BHK')
      .replace(/2bhk/i, '2 BHK')
      .replace(/3bhk/i, '3 BHK');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 flex flex-col pb-20 md:pb-0 w-full max-w-full overflow-x-hidden">
      
      {/* Header */}
      <Header />

      {/* Hero Section with Architectural Blueprint Grid & Amber Glow */}
      <section 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative py-24 border-b border-slate-800 bg-[#0B132B] overflow-hidden transition-all duration-500"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.15), transparent 60%),
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 32px 32px, 32px 32px',
        }}
      >
        {/* Scoped CSS for floating animations */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-12px) rotate(3deg); }
          }
          @keyframes float-delayed {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(12px) rotate(-4deg); }
          }
          .animate-float-slow {
            animation: float-slow 7s ease-in-out infinite;
          }
          .animate-float-delayed {
            animation: float-delayed 9s ease-in-out infinite;
          }
        `}} />

        {/* Ambient Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B132B]/50 via-slate-900/90 to-[#0B132B] pointer-events-none" />

        {/* Floating 3D Architectural Elements */}
        {/* Compass element */}
        <div 
          className="absolute left-[8%] bottom-[12%] opacity-20 pointer-events-none transition-transform duration-300 ease-out select-none hidden lg:block animate-float-delayed"
          style={{ transform: `translate(${mousePos.x * 25}px, ${mousePos.y * 25}px) rotate(${mousePos.y * 15}deg)` }}
        >
          <svg viewBox="0 0 100 100" fill="none" className="w-28 h-28" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 15 L35 75" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
            <path d="M50 15 L65 75" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
            <path d="M30 75 L70 75" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3"/>
            <circle cx="50" cy="15" r="4" fill="#F59E0B"/>
            <path d="M45 35 A12 12 0 0 1 55 35" stroke="#F59E0B" strokeWidth="1.5"/>
          </svg>
        </div>

        {/* Isometric wireframe cube element */}
        <div 
          className="absolute right-[8%] top-[15%] opacity-20 pointer-events-none transition-transform duration-300 ease-out select-none hidden lg:block animate-float-slow"
          style={{ transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -25}px) rotate(${mousePos.x * -15}deg)` }}
        >
          <svg viewBox="0 0 120 120" fill="none" className="w-32 h-32" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 20 L100 40 L60 60 L20 40 Z" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3"/>
            <path d="M20 40 L20 80 L60 100 L60 60 Z" stroke="#F59E0B" strokeWidth="1.5"/>
            <path d="M100 40 L100 80 L60 100" stroke="#F59E0B" strokeWidth="1.5"/>
            <path d="M60 60 L60 100" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="2 2"/>
            <circle cx="60" cy="20" r="3" fill="#F59E0B"/>
            <circle cx="100" cy="40" r="3" fill="#F59E0B"/>
            <circle cx="60" cy="60" r="3" fill="#F59E0B"/>
            <circle cx="20" cy="40" r="3" fill="#F59E0B"/>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center max-w-4xl z-10">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur inline-block">
            📐 Premium Architectural Blueprints
          </span>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mt-8 mb-4 leading-tight">
            Find Your Dream Layout in Our <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              Curated Floor Plans Library
            </span>
          </h1>
          
          <p className="text-slate-300 text-base sm:text-lg font-light max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover complete, ready-to-execute design packages with high-resolution 3D interior renders, material catalogs, and Vastu-compliant structures.
          </p>

          {/* Search Bar Input Container wrapped in Sleek Glassmorphism */}
          <div id="search-bar-container" className="max-w-2xl mx-auto relative mb-8 p-2.5 backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl rounded-2xl transition-all duration-300 hover:border-white/30 hover:bg-white/15">
            <Search className="absolute left-6 top-6 h-5 w-5 text-slate-200" />
            <input
              type="text"
              placeholder="Search by styles (e.g. Modern Ranch, A-Frame, Traditional)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-4 bg-slate-950/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-slate-400 transition"
            />
          </div>

          {/* Responsive Category Carousel Slider with Left/Right controls */}
          <div className="max-w-4xl mx-auto relative px-4 md:px-10 mt-8">
            {/* Left Button */}
            <button
              onClick={() => {
                const slider = document.getElementById('category-slider');
                if (slider) slider.scrollBy({ left: -200, behavior: 'smooth' });
              }}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-slate-900/60 border border-slate-700 text-slate-300 items-center justify-center hover:bg-amber-500/20 hover:border-amber-500/40 hover:text-white transition active:scale-95 shadow-md"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Carousel Container */}
            <div
              id="category-slider"
              className="flex overflow-x-auto gap-2.5 py-2 px-4 whitespace-nowrap scroll-smooth no-scrollbar scrollbar-none justify-start md:justify-center w-full max-w-full"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categoriesList.map((cat) => {
                const isActive = activeChip === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveChip(cat)}
                    className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                      isActive
                        ? 'bg-amber-500 border-transparent text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-white hover:scale-105 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    }`}
                  >
                    {formatCategoryName(cat)}
                  </button>
                );
              })}
            </div>

            {/* Right Button */}
            <button
              onClick={() => {
                const slider = document.getElementById('category-slider');
                if (slider) slider.scrollBy({ left: 200, behavior: 'smooth' });
              }}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-slate-900/60 border border-slate-700 text-slate-300 items-center justify-center hover:bg-amber-500/20 hover:border-amber-500/40 hover:text-white transition active:scale-95 shadow-md"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Slides Content */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col gap-16 overflow-x-hidden">
        
        {loading ? (
          <div className="flex justify-center items-center py-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500" />
          </div>
        ) : (
          <>
            {activeChip === 'All' ? (
              <>
                {/* 1. Featured Plans Carousel */}
                {featuredList.length > 0 && (
                  <CarouselSection
                    title="🌟 Featured & Most Popular Plans"
                    id="carousel-featured"
                    plans={featuredList}
                    getImageUrl={getImageUrl}
                    handleScroll={handleScroll}
                    onViewAll={() => handleViewAll('featured')}
                  />
                )}

                {/* 2. Compact 1 BHK Plans Carousel */}
                {b1hkList.length > 0 && (
                  <CarouselSection
                    title="🏠 Compact 1 BHK & Starter Homes"
                    id="carousel-1bhk"
                    plans={b1hkList}
                    getImageUrl={getImageUrl}
                    handleScroll={handleScroll}
                    onViewAll={() => handleViewAll('1bhk')}
                  />
                )}

                {/* 3. Modern 2 BHK & 3 BHK Family Homes */}
                {b2hk3hkList.length > 0 && (
                  <CarouselSection
                    title="🏡 Modern 2 BHK & 3 BHK Family Homes"
                    id="carousel-family"
                    plans={b2hk3hkList}
                    getImageUrl={getImageUrl}
                    handleScroll={handleScroll}
                    onViewAll={() => handleViewAll('2bhk')}
                  />
                )}

                {/* 4. Luxury Villas & Duplex Designs */}
                {villasList.length > 0 && (
                  <CarouselSection
                    title="🏰 Luxury Villas & Duplex Designs"
                    id="carousel-villas"
                    plans={villasList}
                    getImageUrl={getImageUrl}
                    handleScroll={handleScroll}
                    onViewAll={() => handleViewAll('villas')}
                  />
                )}

                {/* 5. Farmhouses & Ranch Plans */}
                {farmhouseList.length > 0 && (
                  <CarouselSection
                    title="🌾 Farmhouses & Ranch Plans"
                    id="carousel-farmhouse"
                    plans={farmhouseList}
                    getImageUrl={getImageUrl}
                    handleScroll={handleScroll}
                    onViewAll={() => handleViewAll('farmhouse')}
                  />
                )}
              </>
            ) : (
              <div className="flex flex-col gap-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    📁 Category: {formatCategoryName(activeChip)}
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">Found {displayedPlans.length} design options matching your selection</p>
                </div>

                {displayedPlans.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-100 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm flex flex-col items-center gap-6 mt-4 w-full">
                    <div className="h-16 w-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
                      <LayoutGrid className="h-8 w-8 animate-pulse" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900">No Plans Uploaded Yet in This Category</h3>
                      <p className="text-slate-450 text-xs font-light leading-relaxed">
                        We are publishing 10 new architectural blueprints daily! Stay tuned or request a custom layout.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveChip('1bhk')}
                      className="px-6 py-3 bg-slate-900 text-amber-400 hover:bg-slate-800 font-bold rounded-xl transition text-xs flex items-center gap-1 cursor-pointer mx-auto"
                    >
                      <span>View Available 1 BHK Plans</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {displayedPlans
                      .filter((p) => !searchQuery || matchPlan(p, searchQuery))
                      .map((plan) => {
                      const previewImage = getImageUrl(plan.images?.['01_exterior_front_elevation'], plan) || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
                      return (
                        <div
                          key={plan.plan_id}
                          className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col justify-between"
                        >
                          <Link href={`/plans/${plan.plan_id}`} className="cursor-pointer block relative aspect-[4/3] overflow-hidden bg-slate-100 group">
                            <img
                              src={previewImage}
                              alt={plan.title}
                              loading="lazy"
                              draggable="false"
                              onError={(e) => {
                                e.target.onError = null;
                                e.target.src = getFallbackImage(plan.plan_id);
                              }}
                              onContextMenu={(e) => e.preventDefault()}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500 select-none"
                            />
                            {/* Repeating Diagonal Watermark Shield */}
                            <div 
                              className="absolute inset-0 pointer-events-none select-none z-10"
                              style={{
                                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='100' viewBox='0 0 160 100'><text x='50%' y='50%' fill='rgba(255,255,255,0.06)' font-size='10' font-weight='bold' font-family='sans-serif' text-anchor='middle' transform='rotate(-25 80 50)'>ArcNester.store</text></svg>")`,
                                backgroundRepeat: 'repeat'
                              }}
                            />
                            {/* Central Elegant Diagonal Watermark */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20">
                              <span className="text-white/40 text-sm md:text-lg lg:text-xl font-extrabold tracking-widest uppercase transform -rotate-30 select-none pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                                ArcNester.store
                              </span>
                            </div>

                          </Link>

                          <div className="p-5 flex flex-col flex-1 justify-between">
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
                                {plan.plan_id}
                              </span>
                              <Link href={`/plans/${plan.plan_id}`} className="cursor-pointer block">
                                <h3 className="text-base font-extrabold text-slate-900 line-clamp-1 leading-snug hover:text-amber-500 transition">
                                  {plan.title}
                                </h3>
                              </Link>
                              <p className="text-slate-450 text-xs font-light mt-2 line-clamp-2 leading-relaxed">
                                {plan.short_description || plan.blog_content}
                              </p>
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <Maximize2 className="h-3.5 w-3.5 text-amber-500" />
                                <span className="font-bold text-slate-700">{plan.square_footage || 0}</span> sq ft
                              </div>
                              <div className="flex items-center gap-1">
                                <Bed className="h-3.5 w-3.5 text-amber-500" />
                                <span className="font-bold text-slate-700">{plan.bedrooms || 0}</span> BHK
                              </div>
                              <div className="flex items-center gap-1">
                                <Bath className="h-3.5 w-3.5 text-amber-500" />
                                <span className="font-bold text-slate-700">{plan.bathrooms || 0}</span> Bath
                              </div>
                            </div>

                            <div className="mt-5">
                              <Link 
                                href={`/plans/${plan.plan_id}`}
                                className="w-full py-2.5 bg-slate-50 hover:bg-amber-500 hover:text-white border border-slate-200 hover:border-transparent font-bold text-slate-700 rounded-xl transition duration-300 text-xs flex items-center justify-center gap-1 text-center"
                              >
                                <span>View Plan Details</span>
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

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

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-3 px-6 flex items-center justify-between z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-center gap-1 text-amber-500">
          <HomeIcon className="h-5 w-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600">
          <Layers className="h-5 w-5" />
          <span className="text-[10px] font-medium">Catalog</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600">
          <Heart className="h-5 w-5" />
          <span className="text-[10px] font-medium">Saved</span>
        </button>
      </div>

    </div>
  );
}

// Reusable Carousel Section Component
function CarouselSection({ title, id, plans, getImageUrl, handleScroll, onViewAll }) {
  return (
    <div className="flex flex-col">
      {/* Title Header with Slider Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
          <p className="text-slate-400 text-xs mt-1">Found {plans.length} design options</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Scroll arrow buttons (desktop only) */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => handleScroll(id, 'left')}
              className="h-9 w-9 rounded-full bg-white border border-slate-200 text-slate-655 flex items-center justify-center hover:bg-slate-50 transition active:scale-95 shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleScroll(id, 'right')}
              className="h-9 w-9 rounded-full bg-white border border-slate-200 text-slate-655 flex items-center justify-center hover:bg-slate-50 transition active:scale-95 shadow-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <span 
            onClick={onViewAll}
            className="text-xs font-bold text-amber-600 hover:text-amber-500 transition cursor-pointer flex items-center gap-0.5 z-10 pointer-events-auto"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>

      {/* Horizontal Carousel Scroller */}
      <div
        id={id}
        className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory touch-pan-y"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-y' }}
      >
        {plans.map((plan) => {
          const previewImage = getImageUrl(plan.images?.['01_exterior_front_elevation'], plan) || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

          return (
            <div
              key={plan.plan_id}
              className="snap-start shrink-0 w-full max-w-[calc(100vw-2rem)] sm:w-[320px] md:w-[350px] mx-auto bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Preview with Hover Zoom and Watermark protection */}
              <Link href={`/plans/${plan.plan_id}`} className="cursor-pointer block relative aspect-[4/3] overflow-hidden bg-slate-100 group">
                <img
                  src={previewImage}
                  alt={plan.title}
                  loading="lazy"
                  draggable="false"
                  onError={(e) => {
                    e.target.onError = null;
                    e.target.src = getFallbackImage(plan.plan_id);
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 select-none"
                />
                {/* Repeating Diagonal Watermark Shield */}
                <div 
                  className="absolute inset-0 pointer-events-none select-none z-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='100' viewBox='0 0 160 100'><text x='50%' y='50%' fill='rgba(255,255,255,0.06)' font-size='10' font-weight='bold' font-family='sans-serif' text-anchor='middle' transform='rotate(-25 80 50)'>ArcNester.store</text></svg>")`,
                    backgroundRepeat: 'repeat'
                  }}
                />
                {/* Central Elegant Diagonal Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20">
                  <span className="text-white/40 text-sm md:text-lg lg:text-xl font-extrabold tracking-widest uppercase transform -rotate-30 select-none pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                    ArcNester.store
                  </span>
                </div>

              </Link>

              {/* Details card content */}
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
                    {plan.plan_id}
                  </span>
                  
                  <Link href={`/plans/${plan.plan_id}`} className="cursor-pointer block">
                    <h3 className="text-base font-extrabold text-slate-900 line-clamp-1 leading-snug hover:text-amber-500 transition">
                      {plan.title}
                    </h3>
                  </Link>
                  
                  <p className="text-slate-450 text-xs font-light mt-2 line-clamp-2 leading-relaxed">
                    {plan.short_description || plan.blog_content}
                  </p>
                </div>

                {/* Metadata Specs Badges */}
                <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Maximize2 className="h-3.5 w-3.5 text-amber-500" />
                    <span className="font-bold text-slate-700">{plan.square_footage || 0}</span> sq ft
                  </div>
                  <div className="flex items-center gap-1">
                    <Bed className="h-3.5 w-3.5 text-amber-500" />
                    <span className="font-bold text-slate-700">{plan.bedrooms || 0}</span> BHK
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5 text-amber-500" />
                    <span className="font-bold text-slate-700">{plan.bathrooms || 0}</span> Bath
                  </div>
                </div>

                {/* CTA Action button */}
                <div className="mt-5">
                  <Link 
                    href={`/plans/${plan.plan_id}`}
                    className="w-full py-2.5 bg-slate-50 hover:bg-amber-500 hover:text-white border border-slate-200 hover:border-transparent font-bold text-slate-700 rounded-xl transition duration-300 text-xs flex items-center justify-center gap-1 text-center"
                  >
                    <span>View Plan Details</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
