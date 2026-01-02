"use client";

import { useState } from 'react';
import { ArrowRight, Shield, Award, TrendingUp, CheckCircle2, Users, BarChart3, Globe } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('business');

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-950 to-black">
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
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-800 px-5 py-3 rounded-2xl mb-10 shadow-2xl shadow-indigo-600/10">
              <Shield className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-semibold text-gray-300">
                Enterprise-grade platform • Trusted by Fortune 500
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="block text-gray-100">
                Scale with elite{' '}
                <span className="relative">
                  <span className="relative z-10 bg-gradient-to-r from-indigo-500 via-indigo-400 to-blue-500 bg-clip-text text-transparent">
                    content creators
                  </span>
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full" />
                </span>
              </span>
              <span className="block mt-4 text-gray-100">
                who deliver{' '}
                <span className="relative inline-block">
                  <span className="text-gray-100">measurable</span>
                  <TrendingUp className="absolute -top-6 -right-8 w-10 h-10 text-indigo-500" />
                </span>
                {' '}ROI
              </span>
            </h1>

            {/* Serious Value Proposition */}
            <p className="mt-10 text-xl text-gray-400 leading-relaxed font-light max-w-2xl">
              mycreator powers the world&apos;s most demanding brands with vetted, 
              performance-driven creators. Our platform ensures enterprise-grade 
              quality at scale, backed by comprehensive analytics and SLA guarantees.
            </p>

            {/* Enterprise Metrics */}
            <div className="mt-12 grid grid-cols-3 gap-8 border-t border-gray-800 pt-10">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  $2.1B+
                  <Award className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Platform Value</div>
              </div>
              <div className="text-center border-x border-gray-800 px-8">
                <div className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  99.8%
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Uptime SLA</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  SEC
                  <Shield className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Compliant</div>
              </div>
            </div>

            {/* Role Selection - Professional Toggle */}
            <div className="mt-14 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-2 max-w-lg">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('business')}
                  className={`flex-1 py-4 px-6 rounded-lg transition-all duration-300 ${activeTab === 'business' 
                    ? 'bg-gradient-to-r from-indigo-500/20 to-blue-900/20 border border-indigo-500/30 text-white shadow-lg shadow-indigo-500/10' 
                    : 'text-gray-400 hover:text-gray-300'}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5" />
                      <span className="font-semibold">Enterprise</span>
                    </div>
                    <div className="text-xs opacity-75">Brands & Agencies</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('creator')}
                  className={`flex-1 py-4 px-6 rounded-lg transition-all duration-300 ${activeTab === 'creator' 
                    ? 'bg-gradient-to-r from-indigo-500/20 to-blue-900/20 border border-indigo-500/30 text-white shadow-lg shadow-indigo-500/10' 
                    : 'text-gray-400 hover:text-gray-300'}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5" />
                      <span className="font-semibold">Creator Network</span>
                    </div>
                    <div className="text-xs opacity-75">Vetted Professionals</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Dynamic CTA based on selection */}
            <div className="mt-8 max-w-lg">
              {activeTab === 'business' ? (
                <a
                  href="/enterprise-demo"
                  className="group block bg-gradient-to-r from-indigo-600 to-blue-700 text-white px-8 py-5 rounded-xl font-semibold text-center transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-0.5 border border-indigo-500/30"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span>Request Enterprise Demo</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="text-sm text-indigo-200 font-normal mt-2">
                    Speak with our enterprise solutions team
                  </div>
                </a>
              ) : (
                <a
                  href="/creator-application"
                  className="group block bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 text-white px-8 py-5 rounded-xl font-semibold text-center transition-all duration-300 hover:border-indigo-500/30 hover:shadow-2xl hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span>Apply to Creator Network</span>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="text-sm text-gray-400 font-normal mt-2">
                    Rigorous vetting process • Top 3% acceptance rate
                  </div>
                </a>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4" />
                <span>Global Coverage • 150+ Countries</span>
              </div>
              <div className="h-4 w-px bg-gray-800" />
              <div>Enterprise SLAs • SOC2 Certified</div>
            </div>
          </div>

          {/* Right Content - Serious Data Visualization */}
          <div className="relative">
            {/* Premium Glass Card */}
            <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-950/90 backdrop-blur-sm rounded-3xl border border-gray-800 shadow-2xl shadow-indigo-500/5 overflow-hidden">
              {/* Card Header */}
              <div className="p-8 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-950">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Enterprise Dashboard</h3>
                      <p className="text-sm text-gray-400">Live performance analytics</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-8">
                {/* Performance Graph */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-2xl font-bold text-white">$4.2M</div>
                      <div className="text-sm text-gray-400">Generated revenue this quarter</div>
                    </div>
                    <div className="px-3 py-1 bg-emerald-900/30 border border-emerald-800 rounded-full">
                      <span className="text-emerald-400 text-sm font-medium">+24.7%</span>
                    </div>
                  </div>
                  
                  {/* Simplified Graph */}
                  <div className="h-40 relative">
                    <div className="absolute inset-0 flex items-end gap-1">
                      {[40, 60, 80, 65, 90, 85, 95].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-indigo-600 to-blue-600 rounded-t-lg transition-all duration-300 hover:opacity-80"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Performing Creators */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-6">Top Performing Partners</h4>
                  <div className="space-y-4">
                    {[
                      { name: 'TechContent Pro', revenue: '$1.2M', growth: '+32%' },
                      { name: 'BrandVelocity', revenue: '$890K', growth: '+28%' },
                      { name: 'Enterprise Visuals', revenue: '$750K', growth: '+41%' },
                    ].map((creator, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-indigo-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-gradient-to-br from-amber-900/30 to-amber-900/10 border border-amber-800/30' : 'bg-gray-800'}`}>
                            <div className={`font-bold ${i === 0 ? 'text-amber-400' : 'text-gray-400'}`}>#{i + 1}</div>
                          </div>
                          <div>
                            <div className="font-medium text-white">{creator.name}</div>
                            <div className="text-xs text-gray-500">Enterprise tier</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white">{creator.revenue}</div>
                          <div className="text-sm text-emerald-400">{creator.growth}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform Stats */}
                <div className="mt-8 pt-8 border-t border-gray-800">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-gray-900/30 rounded-xl">
                      <div className="text-2xl font-bold text-white">2.4K</div>
                      <div className="text-sm text-gray-400">Active Campaigns</div>
                    </div>
                    <div className="text-center p-4 bg-gray-900/30 rounded-xl">
                      <div className="text-2xl font-bold text-white">97.3%</div>
                      <div className="text-sm text-gray-400">Satisfaction Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -top-4 -right-4">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-indigo-500/30">
                ENTERPRISE EDITION
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Bar */}
        <div className="mt-20 pt-10 border-t border-gray-800">
          <div className="text-center text-gray-500 text-sm uppercase tracking-wider mb-8">
            Trusted by industry leaders
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {['TechCorp', 'GlobalBank', 'EnterpriseX', 'Fortune Co', 'Alpha Group', 'Venture Partners'].map((company) => (
              <div key={company} className="text-center">
                <div className="text-xl font-bold text-gray-700 hover:text-indigo-500 transition-colors cursor-default">
                  {company}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}