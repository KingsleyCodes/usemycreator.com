"use client";

import React from 'react';
import { TrendingUp, Palette, CheckCircle2, ArrowRight, Sparkles, Zap } from 'lucide-react';

const SolutionsPage = () => {
  const solutions = [
    {
      title: "For Business Growth",
      tagline: "Performance Content",
      description: "Acquire high-converting, authentic assets that speak directly to your audience’s pain points.",
      features: ["UGC Video Ads", "Product Photography", "Brand Storytelling", "Social Media Takeovers"],
      icon: <TrendingUp className="h-6 w-6" />,
      accent: "text-primary"
    },
    {
      title: "For Micro-Creators",
      tagline: "Career Infrastructure",
      description: "Monetize your unique voice by partnering with brands that value creativity over follower counts.",
      features: ["Guaranteed Compensation", "Brand Partnerships", "Creative Freedom", "Portfolio Development"],
      icon: <Palette className="h-6 w-6" />,
      accent: "text-primary"
    }
  ];

  return (
    <div className="min-h-screen bg-[#001E00] pt-32 pb-24 px-6 relative overflow-hidden">
      
      {/* --- BRANDED BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-10%,#a3dcf310,transparent_60%)]" />
        {/* Subtle grid to maintain the "infrastructure" feel */}
        <div className="absolute inset-0 opacity-[0.05]" 
             style={{ backgroundImage: `linear-gradient(to right, #a3dcf3 1px, transparent 1px), linear-gradient(to bottom, #a3dcf3 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-6">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">The Synergy Engine</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-medium leading-tight text-white mb-8">
            Solutions for <br />
            <span className="text-primary italic font-normal underline decoration-white/10 underline-offset-8">mutual growth.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            MyCreator connects high-intent brands with niche-specific creators to build content that doesn't just look good—it sells.
          </p>
        </div>

        {/* SOLUTIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {solutions.map((item, idx) => (
            <div key={idx} className="group relative bg-white/5 border border-white/10 rounded-[3rem] p-10 lg:p-16 transition-all hover:border-primary/40 overflow-hidden">
              
              {/* Subtle Icon Background Glow */}
              <div className="absolute -top-10 -right-10 h-40 w-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />

              <div className="relative z-10">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-[#001E00] transition-all duration-500">
                  {item.icon}
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-3">
                  {item.tagline}
                </p>
                <h2 className="text-3xl md:text-4xl font-serif text-white mb-6 tracking-tight">
                  {item.title}
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-10 font-medium">
                  {item.description}
                </p>

                <div className="space-y-4 mb-12">
                  {item.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-gray-300 font-bold text-sm tracking-tight">{feat}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full py-5 rounded-2xl border border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all group-hover:bg-primary group-hover:text-[#001E00] group-hover:border-primary flex items-center justify-center gap-3">
                  Learn More <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM VALUE PROP */}
        <div className="mt-24 text-center">
            <div className="inline-flex items-center gap-4 py-4 px-8 bg-white/5 border border-white/10 rounded-full">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
                    Ready to transform your creative workflow?
                </p>
                <button onClick={() => window.location.href='/login'} className="text-primary font-black text-xs uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1">
                    Get Started <ArrowRight className="h-3 w-3" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionsPage;