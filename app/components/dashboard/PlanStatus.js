"use client";

import React from 'react';
import { CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';

export default function PlanStatus({ user }) {
  const isPro = user?.plan === 'pro';

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-1">Current Infrastructure</h3>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">
            {user?.plan || 'Marketplace'} Tier
          </h2>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
          isPro ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-gray-100 text-gray-500'
        }`}>
          {isPro ? 'Verified Account' : 'Standard Access'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Billing Cycle</p>
          <p className="text-sm font-bold">{isPro ? 'Monthly (₦35,000)' : 'No recurring fees'}</p>
        </div>
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Marketplace Fees</p>
          <p className="text-sm font-bold text-[#22c55e]">{isPro ? '0% - Priority' : '5% per campaign'}</p>
        </div>
      </div>

      {!isPro && (
        <button 
          className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#22c55e] hover:text-black transition-all flex items-center justify-center gap-2"
        >
          <CreditCard className="h-4 w-4" />
          Update Payment Method
        </button>
      )}
    </div>
  );
}