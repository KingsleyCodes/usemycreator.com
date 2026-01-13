"use client";

import { useState } from 'react';
import { 
  ArrowRight, 
  Shield, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Users, 
  BarChart3, 
  Globe, 
  Sparkles 
} from 'lucide-react';
import HomeNavbar from '@/app/components/HomeNavbar'; // Ensure path is correct

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('business');

  return (
    <div className="min-h-screen bg-black">
      {/* INSTITUTIONAL NAVBAR */}
      <HomeNavbar />

      <section className="relative overflow-hidden bg-gradient-to-b from-gray-950 to-black pt-20 sm:pt-28">
        {/* Premium Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(30,58,138,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(79,70,229,0.1),transparent_50%)]" />
          {/* Simple pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl" />
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-indigo-600 rounded-full animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-indigo-600/60 rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28 lg:py-36">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Left Content - Serious Business Focus */}
            <div className="relative z-20">
              {/* Premium Badge */}
              <div className="inline-flex items-center gap-3 bg-gray-900/80 border border-gray-800 px-5 py-3 rounded-2xl mb-10 shadow-2xl">
                <Shield className="w-5 h-5 text-[#a3dcf3]" />
                <span className="text-sm font-semibold text-gray-300 tracking-tight">
                  Enterprise-grade platform • Trusted by Fortune 500
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tighter leading-tight">
                <span className="block text-white">
                  Scale with elite
                </span>
                <span className="block bg-gradient-to-r from-[#a3dcf3] to-blue-500 bg-clip-text text-transparent">
                  content creators.
                </span>
              </h1>

              {/* Serious Value Proposition */}
              <p className="mt-10 text-xl text-gray-400 leading-relaxed font-medium max-w-xl">
                MyCreator powers high-growth brands with vetted, 
                performance-driven talent. Quality at scale, backed by 
                institutional analytics.
              </p>

              {/* Enterprise Metrics */}
              <div className="mt-12 grid grid-cols-3 gap-8 border-t border-gray-800 pt-10">
                <div className="text-center md:text-left">
                  <div className="text-2xl font-bold text-white mb-1 flex items-center justify-center md:justify-start gap-2">
                    $2.1B+
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Market Value</div>
                </div>
                <div className="text-center md:text-left border-x border-gray-800 px-4 md:px-8">
                  <div className="text-2xl font-bold text-white mb-1 flex items-center justify-center md:justify-start gap-2">
                    99.8%
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Uptime SLA</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-2xl font-bold text-white mb-1 flex items-center justify-center md:justify-start gap-2">
                    SEC
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Compliant</div>
                </div>
              </div>

              {/* Role Selection - Professional Toggle */}
              <div className="mt-14 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-1.5 max-w-lg">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('business')}
                    className={`flex-1 py-4 px-6 rounded-lg transition-all duration-300 ${activeTab === 'business' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-xs uppercase tracking-widest">Enterprise</span>
                      <span className="text-[10px] opacity-60">Brands & Agencies</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('creator')}
                    className={`flex-1 py-4 px-6 rounded-lg transition-all duration-300 ${activeTab === 'creator' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-xs uppercase tracking-widest">Creators</span>
                      <span className="text-[10px] opacity-60">Professional Talent</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Dynamic CTA */}
              <div className="mt-8 max-w-lg">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="w-full group bg-white text-black px-8 py-5 rounded-xl font-bold uppercase text-xs tracking-[0.2em] transition-all hover:bg-[#a3dcf3] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                >
                  {activeTab === 'business' ? 'Request Enterprise Demo' : 'Apply to Network'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Content - Data Visualization */}
            <div className="relative hidden lg:block">
              <div className="relative bg-white rounded-[2rem] border border-gray-200 shadow-2xl overflow-hidden p-1">
                {/* Header of the mock card */}
                <div className="bg-gray-50 border-b border-gray-100 p-8 rounded-t-[1.8rem]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-black rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-[#a3dcf3]" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-bold text-lg leading-tight">Institutional Portal</h3>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Real-time Attribution</p>
                      </div>
                    </div>
                    <div className="h-2 w-12 bg-gray-200 rounded-full" />
                  </div>
                </div>

                {/* Content of the mock card */}
                <div className="p-8 bg-white">
                  <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Campaign ROI</p>
                      <p className="text-3xl font-black text-gray-900">4.8x</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Conversions</p>
                      <p className="text-3xl font-black text-emerald-600">+22%</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border border-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-gray-100 rounded text-[10px] flex items-center justify-center font-bold">CT</div>
                          <div className="h-2 w-24 bg-gray-100 rounded" />
                        </div>
                        <div className="h-2 w-12 bg-[#a3dcf3] rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Element */}
              <div className="absolute -bottom-6 -right-6 bg-black text-white p-6 rounded-2xl border border-gray-800 shadow-2xl animate-bounce">
                <Sparkles className="h-6 w-6 text-[#a3dcf3]" />
              </div>
            </div>
          </div>

          {/* Bottom Trust Bar */}
          <div className="mt-20 pt-10 border-t border-gray-800/50">
            <div className="text-center text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-12">
              The Standard for Brand-Creator Partnerships
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
              {['TechCorp', 'GlobalBank', 'EnterpriseX', 'Fortune Co', 'Alpha Group', 'Venture Partners'].map((company) => (
                <div key={company} className="text-center text-lg font-bold text-white tracking-tighter">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}