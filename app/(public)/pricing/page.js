"use client";

import { Check, Zap, Shield, Crown, ArrowRight } from 'lucide-react';

const PricingPage = () => {
  const models = [
    {
      name: 'Marketplace',
      tagline: 'Pay as you grow',
      price: 'Free Entry',
      description: 'Perfect for businesses starting with micro-creators.',
      features: ['Unlimited Briefs', 'Secure Escrow', 'Direct Messaging', 'Basic Analytics'],
      cta: 'Start Posting',
      highlight: false
    },
    {
      name: 'Pro Studio',
      tagline: 'For high-growth brands',
      price: '₦35,000',
      period: '/mo',
      description: 'Advanced tools to scale your content production.',
      features: ['Verified Creator Access', '0% Marketplace Fees', 'Legal Contract Templates', 'Priority Support'],
      cta: 'Go Pro',
      highlight: true
    },
    {
      name: 'Enterprise',
      tagline: 'The institutional choice',
      price: 'Custom',
      description: 'Full-service management for large scale operations.',
      features: ['Dedicated Account Manager', 'Custom ROI Reporting', 'Bulk Payout API', 'Managed Campaigns'],
      cta: 'Contact Sales',
      highlight: false
    },
  ];

  return (
    <div className="bg-[#001E00] min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Background Retouch */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-10%,#a3dcf315,transparent_60%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Pricing Infrastructure</span>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6">
            Invest in <span className="italic text-primary">influence.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Transparent pricing designed for the Nigerian creator economy. No hidden fees, just pure growth.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {models.map((tier) => (
            <div 
              key={tier.name} 
              className={`relative p-10 rounded-[2.5rem] flex flex-col transition-all duration-500 ${
                tier.highlight 
                ? 'bg-primary text-[#001E00] scale-105 z-20 shadow-[0_0_50px_rgba(163,220,243,0.3)]' 
                : 'bg-white/5 border border-white/10 text-white hover:border-primary/50'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-xl">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${tier.highlight ? 'text-[#001E00]/60' : 'text-primary'}`}>
                  {tier.tagline}
                </p>
                <h3 className="text-3xl font-bold tracking-tighter mb-4">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black">{tier.price}</span>
                  {tier.period && <span className="text-sm font-bold opacity-60">{tier.period}</span>}
                </div>
                <p className={`mt-4 text-sm font-medium ${tier.highlight ? 'text-[#001E00]/70' : 'text-gray-400'}`}>
                  {tier.description}
                </p>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm font-bold tracking-tight">
                    <div className={`p-1 rounded-full ${tier.highlight ? 'bg-[#001E00]/10' : 'bg-primary/20'}`}>
                      <Check className={`h-3 w-3 ${tier.highlight ? 'text-[#001E00]' : 'text-primary'}`} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                tier.highlight 
                ? 'bg-[#001E00] text-white hover:bg-white hover:text-black' 
                : 'bg-primary text-[#001E00] hover:bg-white'
              }`}>
                {tier.cta} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Transaction Fee Note */}
        <p className="mt-16 text-center text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
          Standard Marketplace Fee: 5% for Brands • 10% for Creators
        </p>
      </div>
    </div>
  );
};

export default PricingPage;