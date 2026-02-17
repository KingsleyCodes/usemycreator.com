"use client";

import React, { useState, useEffect } from 'react';
import { calculateFairPrice } from '@/lib/pricingConfig';

export default function MarketSentiment({ offerAmount, targetViews, niche }) {
  const [sentiment, setSentiment] = useState({ label: 'Calculating', color: 'bg-gray-200', width: '0%', text: 'text-gray-400' });

  useEffect(() => {
    // Calculate what the fair price SHOULD be for these views/niche
    const estimatedFMV = calculateFairPrice(targetViews, niche);
    const ratio = offerAmount / estimatedFMV;
    
    if (offerAmount <= 0) {
      setSentiment({ label: 'No Offer', color: 'bg-gray-100', width: '0%', text: 'text-gray-400' });
    } else if (ratio < 0.5) {
      setSentiment({ label: 'Low - Likely Ignored', color: 'bg-red-500', width: '25%', text: 'text-red-600' });
    } else if (ratio >= 0.5 && ratio < 0.9) {
      setSentiment({ label: 'Fair - Budget Friendly', color: 'bg-yellow-500', width: '50%', text: 'text-yellow-700' });
    } else if (ratio >= 0.9 && ratio < 1.3) {
      setSentiment({ label: 'Great - Competitive', color: 'bg-[#22c55e]', width: '80%', text: 'text-[#22c55e]' });
    } else {
      setSentiment({ label: 'Elite - Top Priority', color: 'bg-emerald-500', width: '100%', text: 'text-emerald-600' });
    }
  }, [offerAmount, targetViews, niche]);

  return (
    <div className="mt-4 p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Market Sentiment</span>
        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${sentiment.color} text-white transition-all`}>
          {sentiment.label}
        </span>
      </div>
      
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${sentiment.color} transition-all duration-700 ease-in-out`} 
          style={{ width: sentiment.width }}
        />
      </div>

      <p className="mt-3 text-[11px] font-medium text-gray-500 leading-relaxed">
        {offerAmount < 5000 
          ? "Offers below ₦5,000 rarely get accepted in the Nigerian market."
          : `This budget is being compared against ${niche} market benchmarks.`}
      </p>
    </div>
  );
}