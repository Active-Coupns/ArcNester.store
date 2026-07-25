'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Lock, 
  CheckCircle, 
  Zap, 
  Calculator,
  Paintbrush
} from 'lucide-react';

export default function ToolsPage() {
  // Hero Interactive Estimator States
  const [estArea, setEstArea] = useState(1000);
  const [estQuality, setEstQuality] = useState('standard');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadName, setLeadName] = useState('');
  const [isHeroEstUnlocked, setIsHeroEstUnlocked] = useState(false);
  const [isHeroAdPlaying, setIsHeroAdPlaying] = useState(false);
  const [heroAdTimeLeft, setHeroAdTimeLeft] = useState(15);

  // Paint & Tiles States
  const [calcTab, setCalcTab] = useState('construction'); // construction, paint
  const [roomLength, setRoomLength] = useState(15);
  const [roomWidth, setRoomWidth] = useState(12);
  const [roomHeight, setRoomHeight] = useState(10);

  useEffect(() => {
    let timer;
    if (isHeroAdPlaying && heroAdTimeLeft > 0) {
      timer = setInterval(() => {
        setHeroAdTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isHeroAdPlaying && heroAdTimeLeft === 0) {
      setIsHeroAdPlaying(false);
      setIsHeroEstUnlocked(true);
    }
    return () => clearInterval(timer);
  }, [isHeroAdPlaying, heroAdTimeLeft]);

  const startHeroAdFlow = (e) => {
    e.preventDefault();
    setHeroAdTimeLeft(15);
    setIsHeroAdPlaying(true);
  };

  const heroRates = { standard: 120, premium: 180, luxury: 270 };
  const heroCost = estArea * heroRates[estQuality];
  const heroCement = Math.round(estArea * 0.40);
  const heroSteel = ((estArea * 1.8) / 1000).toFixed(2);
  const heroBricks = Math.round(estArea * 9);

  // Paint & Tiles calculations
  const roomSurfaceArea = 2 * roomHeight * (roomLength + roomWidth) + roomLength * roomWidth;
  const floorArea = roomLength * roomWidth;
  const paintNeeded = Math.ceil(roomSurfaceArea * 0.01);
  const tilesNeeded = Math.ceil(floorArea * 1.1);

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
            <Link href="/tools" className="text-amber-500 border-b-2 border-amber-500 pb-1">Estimator Tools</Link>
            <Link href="/financing" className="hover:text-slate-900 transition">Loans & Insurance</Link>
          </nav>
        </div>
      </header>

      {/* Hero Head */}
      <section className="bg-white border-b border-slate-100 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <span className="text-amber-600 font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
            Estimation Suite
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-4 mb-2">
            Interactive Construction Estimators
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto font-light">
            Plan your project budget and calculate materials instantly with our smart tools.
          </p>
        </div>
      </section>

      {/* Interactive Estimator Widget */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-30 flex-1">
        <div className="bg-white border border-slate-100 p-8 sm:p-10 rounded-3xl shadow-xl max-w-4xl mx-auto flex flex-col gap-6">
          
          {/* Tab Selector */}
          <div className="flex border-b border-slate-100 pb-3 text-sm font-bold gap-6">
            <button
              onClick={() => {
                setCalcTab('construction');
                setIsHeroEstUnlocked(false);
              }}
              className={`pb-2 border-b-2 transition duration-200 flex items-center gap-1.5 ${
                calcTab === 'construction' ? 'border-amber-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Calculator className="h-4 w-4 text-amber-500" />
              <span>Construction & Material Cost</span>
            </button>
            <button
              onClick={() => {
                setCalcTab('paint');
                setIsHeroEstUnlocked(false);
              }}
              className={`pb-2 border-b-2 transition duration-200 flex items-center gap-1.5 ${
                calcTab === 'paint' ? 'border-amber-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Paintbrush className="h-4 w-4 text-amber-500" />
              <span>Paint & Tiles Requirement</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Column: Form */}
            <div className="flex flex-col gap-5">
              <div>
                <span className="text-[10px] font-mono text-amber-600 uppercase tracking-widest font-bold">Interactive Calculator</span>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {calcTab === 'construction' ? 'Instant Construction & Material Estimator' : 'Room Paint & Tiles Calculator'}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Watch a sponsored 15-sec ad to calculate exact quantities for your build</p>
              </div>

              <form onSubmit={startHeroAdFlow} className="flex flex-col gap-4">
                {calcTab === 'construction' ? (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plot Area (Sq. Ft.)</label>
                      <input
                        type="number"
                        required
                        min={100}
                        max={50000}
                        value={estArea}
                        onChange={(e) => setEstArea(Number(e.target.value))}
                        className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Finish Quality Grade</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['standard', 'premium', 'luxury'].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setEstQuality(lvl)}
                            className={`py-2 px-3 rounded-xl border text-[10px] font-bold uppercase transition ${
                              estQuality === lvl
                                ? 'bg-amber-500 text-white border-transparent shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Length (Ft)</label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={500}
                          value={roomLength}
                          onChange={(e) => setRoomLength(Number(e.target.value))}
                          className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Width (Ft)</label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={500}
                          value={roomWidth}
                          onChange={(e) => setRoomWidth(Number(e.target.value))}
                          className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Height (Ft)</label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={100}
                          value={roomHeight}
                          onChange={(e) => setRoomHeight(Number(e.target.value))}
                          className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs font-semibold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl transition duration-300 text-xs shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>🔓 Calculate & Unlock Estimation Report</span>
                </button>
              </form>
            </div>

            {/* Right Column: Output Card */}
            <div className="bg-slate-50 border border-slate-200/50 p-6 rounded-3xl h-full flex flex-col justify-center relative overflow-hidden min-h-[300px]">
              {isHeroEstUnlocked ? (
                <div className="flex flex-col gap-4 text-xs">
                  <div className="bg-green-50 border border-green-200 text-green-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 w-fit">
                    <CheckCircle className="h-4 w-4" />
                    <span>✅ Calculation Report Ready</span>
                  </div>

                  {calcTab === 'construction' ? (
                    <div className="bg-white border border-slate-100 p-4.5 rounded-2xl flex flex-col gap-2.5">
                      <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                        <span className="font-bold text-slate-800">Total Construction Cost</span>
                        <span className="text-lg font-black text-amber-600">${heroCost.toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-slate-655">
                        <div>
                          <span className="text-[10px] text-slate-450 block uppercase tracking-wider font-bold">Cement Needed</span>
                          <span className="text-sm font-bold text-slate-800">{heroCement} Bags</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-455 block uppercase tracking-wider font-bold">Steel Needed</span>
                          <span className="text-sm font-bold text-slate-800">{heroSteel} Tons</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-455 block uppercase tracking-wider font-bold">Bricks Needed</span>
                          <span className="text-sm font-bold text-slate-800">{heroBricks.toLocaleString()} Blocks</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-455 block uppercase tracking-wider font-bold">Area Limit</span>
                          <span className="text-sm font-bold text-slate-800">{estArea} Sq Ft</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-100 p-4.5 rounded-2xl flex flex-col gap-2.5">
                      <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                        <span className="font-bold text-slate-800">Total Floor Area</span>
                        <span className="text-lg font-black text-amber-600">{floorArea} Sq.Ft.</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-slate-655">
                        <div>
                          <span className="text-[10px] text-slate-455 block uppercase tracking-wider font-bold">Paint Needed</span>
                          <span className="text-sm font-bold text-slate-800">{paintNeeded} Gallons</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-455 block uppercase tracking-wider font-bold">Tiles Needed</span>
                          <span className="text-sm font-bold text-slate-800">{tilesNeeded} Sq.Ft.</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-455 block uppercase tracking-wider font-bold">Surface Area</span>
                          <span className="text-sm font-bold text-slate-800">{roomSurfaceArea} Sq.Ft.</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-455 block uppercase tracking-wider font-bold">Dimensions</span>
                          <span className="text-sm font-bold text-slate-800">{roomLength}'x{roomWidth}'x{roomHeight}'</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => alert("Report downloaded successfully!")}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition text-xs shadow-md"
                  >
                    Download Complete Estimator Report
                  </button>
                </div>
              ) : (
                <div className="text-center py-10 flex flex-col items-center justify-center gap-4">
                  <Lock className="h-10 w-10 text-slate-300" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Report Calculations Locked</h4>
                    <p className="text-slate-400 text-xs mt-1 max-w-[250px] mx-auto leading-relaxed">
                      Submit the form and watch the 15-second calculation ad to unlock {calcTab === 'construction' ? 'cement, steel, and cost estimates.' : 'paint, tile, and surface calculations.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sponsored calculation reward ad modal for Hero Calculator */}
      {isHeroAdPlaying && (
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
                Calculating Plot Quantities & Estimations
              </h3>
              <p className="text-slate-450 text-[11px] font-light leading-relaxed">
                Loading cost model calculators for area: <span className="font-mono text-slate-800 font-bold">{estArea} Sq.Ft</span>. Please wait while calculations compile.
              </p>
            </div>

            {/* Countdown visual */}
            <div className="bg-slate-900 border border-slate-800 text-white font-mono py-4 px-6 rounded-2xl w-full flex items-center justify-center gap-3">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              <span className="text-xs font-bold">
                Calculating... {heroAdTimeLeft}s remaining
              </span>
            </div>

            {/* Cancel option */}
            <button
              type="button"
              onClick={() => setIsHeroAdPlaying(false)}
              className="text-[10px] text-slate-400 hover:text-slate-655 transition font-medium"
            >
              Cancel Ad (Calculations will remain locked)
            </button>

          </div>
        </div>
      )}

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
