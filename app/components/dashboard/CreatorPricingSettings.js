"use client";

import React, { useState, useEffect } from 'react';
import { NICHES, calculateFairPrice } from '@/lib/pricingConfig';

export default function CreatorPricingSettings({ initialData, onSave }) {
  // Local state for the pricing inputs
  const [views, setViews] = useState(initialData?.avgViews || 0);
  const [niche, setNiche] = useState(initialData?.niche || 'lifestyle');
  const [isVerified, setIsVerified] = useState(initialData?.isVerified || false);
  const [suggestedRate, setSuggestedRate] = useState(0);

  // Automatically recalculate whenever inputs change
  useEffect(() => {
    const rate = calculateFairPrice(views, niche, isVerified);
    setSuggestedRate(rate);
  }, [views, niche, isVerified]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm w-full">
      <div className="flex flex-col gap-1 mb-8">
        <h2 className="text-2xl font-serif text-[#001E00]">Smart Rate Calculator</h2>
        <p className="text-gray-400 text-sm">Set your rates based on real-time Nigerian market data.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT SIDE: INPUTS */}
        <div className="space-y-8">
          {/* 1. Average Views Input */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">
              Average Video Views
            </label>
            <div className="relative">
              <input 
                type="number" 
                value={views}
                onChange={(e) => setViews(Number(e.target.value))}
                className="w-full bg-gray-50 border-none rounded-2xl p-5 text-xl font-bold focus:ring-2 focus:ring-[#a3dcf3] transition-all"
                placeholder="e.g. 5000"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 font-bold">Views</span>
            </div>
          </div>

          {/* 2. Niche Selection */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">
              Your Primary Niche
            </label>
            <div className="grid grid-cols-2 gap-2">
              {NICHES.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setNiche(n.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                    niche === n.id 
                      ? 'border-[#a3dcf3] bg-[#a3dcf3]/5 text-[#001E00]' 
                      : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{n.icon}</span>
                  <span className="text-[11px] font-bold uppercase tracking-tight">{n.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: THE RESULT CARD */}
        <div className="flex flex-col justify-between">
          <div className="bg-[#001E00] rounded-[2.5rem] p-8 text-center flex-grow flex flex-col justify-center items-center relative overflow-hidden">
            {/* Subtle glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#a3dcf3]/10 blur-[50px] rounded-full" />
            
            <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] text-[#a3dcf3]">
              Suggested Creator Fee
            </span>
            <div className="relative z-10 text-5xl font-serif text-white mt-4 mb-4">
              ₦{suggestedRate.toLocaleString()}
            </div>
            <div className="relative z-10 inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-bold text-white uppercase tracking-widest">Market Optimized</span>
            </div>
            <p className="relative z-10 text-gray-400 text-[11px] max-w-[200px] mx-auto leading-relaxed">
              This rate ensures you stay competitive while covering data, power, and production costs.
            </p>
          </div>

          <button 
            onClick={() => onSave({ avgViews: views, niche, baseRate: suggestedRate })}
            className="w-full mt-6 bg-[#a3dcf3] text-[#001E00] py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all shadow-md active:scale-[0.98]"
          >
            Apply to Profile
          </button>
        </div>
      </div>
    </div>
  );
}