"use client";

import React from 'react';
import { BadgeCheck, Instagram, Twitter, Youtube, ArrowUpRight, Sparkles, Filter } from 'lucide-react';

const CreatorNetwork = () => {
  const categories = ['Lifestyle', 'Tech', 'Fashion', 'Food', 'Beauty', 'Gaming'];
  
  const featuredCreators = [
    { name: "Tunde Vibe", niche: "Tech & Setup", reach: "12.4k", platforms: [<Instagram key="1" />, <Twitter key="2" />], image: "bg-gray-800" },
    { name: "Amina Glow", niche: "Beauty & Skincare", reach: "8.1k", platforms: [<Instagram key="1" />, <Youtube key="2" />], image: "bg-gray-700" },
    { name: "Chef Kemi", niche: "Food & Recipes", reach: "15.9k", platforms: [<Instagram key="1" />, <Twitter key="2" />], image: "bg-gray-600" },
  ];

  return (
    <div className="min-h-screen bg-[#001E00] pt-32 pb-24 px-6 relative overflow-hidden">
      
      {/* BACKGROUND DEPTH */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(circle_at_20%_-10%,#a3dcf310,transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">The Elite Network</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6">
            Real people. <span className="italic text-primary">Real influence.</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            We focus on micro-creators who produce authentic content that converts, 
            eliminating the noise of vanity metrics.
          </p>
        </div>

        {/* CATEGORY SELECTOR */}
        <div className="flex flex-wrap justify-center gap-3 mb-20">
          {categories.map((cat) => (
            <button key={cat} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-primary hover:text-[#001E00] transition-all">
              {cat}
            </button>
          ))}
          <button className="px-4 py-3 bg-primary/20 text-primary border border-primary/30 rounded-2xl">
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {/* CREATOR MARKETPLACE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {featuredCreators.map((creator, i) => (
            <div key={i} className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-primary/50 transition-all">
              {/* Profile Image / Placeholder */}
              <div className={`h-64 w-full ${creator.image} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-t from-[#001E00] to-transparent opacity-60" />
                <div className="absolute top-6 left-6 flex gap-2">
                  <div className="bg-primary/90 text-[#001E00] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter">
                    Micro-Elite
                  </div>
                </div>
              </div>

              {/* Creator Info */}
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <h3 className="text-xl font-bold text-white tracking-tight">{creator.name}</h3>
                      <BadgeCheck className="h-5 w-5 text-primary fill-primary/10" />
                    </div>
                    <p className="text-primary text-xs font-bold uppercase tracking-widest italic">{creator.niche}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black text-lg">{creator.reach}</p>
                    <p className="text-gray-500 text-[9px] font-bold uppercase">Avg. Reach</p>
                  </div>
                </div>

                {/* Social Handles */}
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex gap-4 text-gray-400">
                    {creator.platforms.map((Icon, idx) => (
                      <span key={idx} className="hover:text-primary transition-colors">{Icon}</span>
                    ))}
                  </div>
                  <button className="text-white group-hover:text-primary transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                    View Studio <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* JOIN THE NETWORK CTA */}
        <div className="relative p-12 md:p-20 bg-primary rounded-[3rem] text-[#001E00] overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-20 group-hover:scale-110 transition-transform">
             <Sparkles className="h-32 w-32" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-4xl md:text-5xl font-serif font-medium mb-6 leading-tight">
              Build your portfolio, <br /><span className="italic underline decoration-[#001E00]/20">get paid instantly.</span>
            </h3>
            <p className="text-[#001E00]/70 font-medium text-lg mb-10">
              Join thousands of creators helping global businesses grow. No more chasing invoices—receive payouts the moment your content is approved.
            </p>
            <button className="bg-[#001E00] text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-white hover:text-black transition-all flex items-center gap-3">
              Apply to Join Network <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorNetwork;