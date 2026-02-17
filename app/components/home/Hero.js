"use client";

import { useState } from 'react';
import { ArrowRight, Sparkles, Play, Users, CheckCircle2 } from 'lucide-react';

export default function Hero() {
  // We define the new Green primary color here for consistency
  const primaryGreen = "#22c55e"; 

  return (
    /* Keeping -mt-1 to sit flush under the Navbar */
    <section className="relative overflow-hidden bg-[#001E00] pt-24 pb-20 lg:pt-36 lg:pb-40 -mt-1">
      
      {/* --- ADVANCED BACKGROUND DESIGN --- */}
      <div className="absolute inset-0 z-0">
        {/* 1. The Grid Layer - Updated to Green Grid */}
        <div className="absolute inset-0 opacity-[0.1] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" 
             style={{ 
               backgroundImage: `linear-gradient(to right, ${primaryGreen} 1px, transparent 1px), linear-gradient(to bottom, ${primaryGreen} 1px, transparent 1px)`, 
               backgroundSize: '60px 60px' 
             }} />
        
        {/* 2. Primary Brand Glow (Top) - Updated to Green */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#22c55e]/20 blur-[120px] rounded-full animate-pulse" />
        
        {/* 3. Secondary Accent Glow (Bottom Right) */}
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#22c55e]/10 blur-[100px] rounded-full" />

        {/* 4. Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>
      {/* --- END BACKGROUND DESIGN --- */}

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-center text-center">
          
          {/* Animated Badge - Text & Icon updated to Green */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-1000">
            <Sparkles className="w-3.5 h-3.5 text-[#22c55e]" />
            <span className="text-[10px] font-black text-[#22c55e] uppercase tracking-[0.3em]">
              The Micro-Creator Network
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-[1.1] tracking-tight text-white mb-8 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            Connecting businesses to <br />
            <span className="text-[#22c55e] italic font-normal">micro-creators</span> at scale.
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-12 font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Stop overpaying for reach. Start investing in conversion with real creators who have real influence in their niche.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <button
              onClick={() => window.location.href = '/onboarding'}
              className="w-full sm:w-auto bg-[#22c55e] text-[#001E00] px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all hover:bg-white hover:scale-[1.05] flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(34,197,94,0.3)]"
            >
              Start Your Campaign
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button className="w-full sm:w-auto bg-white/5 backdrop-blur-md text-white border border-white/10 px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all hover:bg-white/10 flex items-center justify-center gap-3">
              <Play className="w-4 h-4 fill-current" />
              See how it works
            </button>
          </div>

          {/* Trust Section */}
          <div className="relative w-full pt-16">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#22c55e]/50 to-transparent" />
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              <div className="flex items-center gap-2 group">
                <Users className="text-[#22c55e] h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="text-white/80 font-bold text-sm tracking-tighter">5,000+ Vetted Creators</span>
              </div>
              <div className="flex items-center gap-2 group">
                <CheckCircle2 className="text-[#22c55e] h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="text-white/80 font-bold text-sm tracking-tighter">Escrow-Protected Payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}