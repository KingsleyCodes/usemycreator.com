"use client";

import React from 'react';
import { Lock, Sparkles, ArrowUpCircle } from 'lucide-react';
import Link from 'next/link';

export default function Gatekeeper({ children, userPlan, userRole, requiredPlan = 'pro' }) {
  
  // THE OWNER BYPASS:
  // We check for "Owner" (exactly as it appears in your Firestore)
  const isOwner = userRole === 'Owner';

  const hasAccess = 
    isOwner || 
    userPlan === 'enterprise' || 
    (userPlan === 'pro' && requiredPlan !== 'enterprise') || 
    userPlan === requiredPlan;

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#001E00]/50 p-12 text-center backdrop-blur-md">
      {/* Brand Glow (Sky Blue) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#22c55e]/10 blur-[80px] rounded-full" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="h-16 w-16 rounded-3xl bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e] mb-6 border border-[#22c55e]/20">
          <Lock className="h-6 w-6" />
        </div>
        
        <h4 className="text-2xl font-serif text-white mb-3 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-[#22c55e]" />
          Unlock {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} Features
        </h4>
        
        <p className="text-gray-400 text-base mb-8 max-w-sm mx-auto leading-relaxed">
          Upgrade to the {requiredPlan} plan to unlock professional creator tools.
        </p>
        
        <Link 
          href="/pricing"
          className="bg-[#22c55e] text-[#001E00] px-10 py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-white transition-all flex items-center gap-2"
        >
          <ArrowUpCircle className="h-4 w-4" />
          Upgrade Now
        </Link>
      </div>
    </div>
  );
}