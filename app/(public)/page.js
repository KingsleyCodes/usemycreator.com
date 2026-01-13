"use client";

import { useState } from 'react';
import { 
  ArrowRight, 
  Shield, 
  TrendingUp, 
  Sparkles 
} from 'lucide-react';
import HomeNavbar from '@/app/components/HomeNavbar';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('business');

  return (
    <div className="min-h-screen bg-black">
      {/* INSTITUTIONAL NAVBAR COMPONENT 
          This component handles its own sticky positioning and background logic.
      */}
      <HomeNavbar />

      <main className="relative overflow-hidden bg-gradient-to-b from-gray-950 to-black pt-24 sm:pt-32">
        {/* Abstract Background Accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(163,220,243,0.08),transparent_50%)]" />
          <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-900/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Left Column: Hero Narrative */}
            <div className="relative z-20">
              {/* Institutional Badge */}
              <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-lg mb-8 shadow-2xl">
                <Shield className="w-4 h-4 text-[#a3dcf3]" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  Enterprise Deployment Ready
                </span>
              </div>

              {/* High-Contrast Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[0.95] mb-8">
                <span className="block text-white">Scale with elite</span>
                <span className="block text-[#a3dcf3]">creators.</span>
              </h1>

              <p className="text-lg text-gray-400 leading-relaxed font-medium max-w-xl mb-12">
                The institutional standard for content partnerships. We connect 
                high-growth brands with vetted talent through a secure, 
                data-driven ecosystem.
              </p>

              {/* Role Selection Toggle */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1.5 max-w-sm mb-8">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('business')}
                    className={`flex-1 py-3 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                      activeTab === 'business' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Enterprise
                  </button>
                  <button
                    onClick={() => setActiveTab('creator')}
                    className={`flex-1 py-3 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                      activeTab === 'creator' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Creators
                  </button>
                </div>
              </div>

              {/* Primary Call to Action */}
              <button
                onClick={() => window.location.href = '/login'}
                className="group w-full sm:w-auto bg-[#a3dcf3] text-black px-10 py-5 rounded-xl font-black uppercase text-xs tracking-[0.2em] transition-all hover:bg-white hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(163,220,243,0.15)]"
              >
                {activeTab === 'business' ? 'Begin Deployment' : 'Apply for Access'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Performance Metrics */}
              <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-10">
                <div>
                  <div className="text-xl font-bold text-white mb-1">99.8%</div>
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Success Rate</div>
                </div>
                <div className="border-x border-white/10 px-8">
                  <div className="text-xl font-bold text-white mb-1">24h</div>
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Avg. Match</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white mb-1">SEC</div>
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Compliant</div>
                </div>
              </div>
            </div>

            {/* Right Column: Portal Preview */}
            <div className="relative hidden lg:block">
              <div className="relative bg-white rounded-[2.5rem] border border-gray-200 shadow-[0_50px_100px_rgba(0,0,0,0.4)] overflow-hidden">
                {/* Mock UI Header */}
                <div className="bg-gray-50 border-b border-gray-100 p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-black rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-[#a3dcf3]" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-bold text-sm uppercase tracking-tighter">Campaign Analytics</h3>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Institutional Tier</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-gray-200" />
                      <div className="w-2 h-2 rounded-full bg-gray-200" />
                    </div>
                  </div>
                </div>

                {/* Mock UI Body */}
                <div className="p-8 space-y-8 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-center">ROI Index</p>
                      <p className="text-3xl font-black text-gray-900 text-center">4.82</p>
                    </div>
                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-center">Growth</p>
                      <p className="text-3xl font-black text-emerald-600 text-center">+31%</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center px-4 justify-between">
                         <div className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded bg-gray-200" />
                            <div className="h-2 w-24 bg-gray-200 rounded-full" />
                         </div>
                         <div className="h-2 w-8 bg-[#a3dcf3] rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative Sparkle */}
              <div className="absolute -bottom-6 -right-6 bg-black p-5 rounded-2xl border border-white/10 shadow-2xl">
                <Sparkles className="h-6 w-6 text-[#a3dcf3]" />
              </div>
            </div>
          </div>

          {/* Institutional Trust Section */}
          <div className="mt-32 pt-12 border-t border-white/5">
            <p className="text-center text-gray-600 text-[10px] font-bold uppercase tracking-[0.4em] mb-12">
              Powering global creative infrastructure
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-10 opacity-30 grayscale brightness-200">
              <span className="text-xl font-black tracking-tighter text-white">TECHCORP</span>
              <span className="text-xl font-black tracking-tighter text-white">GLOBAL.BANK</span>
              <span className="text-xl font-black tracking-tighter text-white">ALPHA.GROUP</span>
              <span className="text-xl font-black tracking-tighter text-white">FORTUNE.500</span>
              <span className="text-xl font-black tracking-tighter text-white">V_PARTNERS</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}