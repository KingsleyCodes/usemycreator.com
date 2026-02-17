"use client";

import React, { useEffect } from 'react';
import { Check, PartyPopper, Zap, Shield, Crown, ArrowRight } from 'lucide-react';
import * as fbq from '@/lib/fpixel'; // Import Pixel utility
import confetti from 'canvas-confetti'; // Ensure this is installed

export default function UpgradeSuccess({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      // 1. Trigger Facebook Pixel Purchase Event
      fbq.event('Purchase', {
        value: 50000.00, // Amount in Naira
        currency: 'NGN',
        content_name: 'Pro Studio Upgrade',
        content_category: 'Subscription'
      });

      // 2. Trigger a celebration blast
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#001E00', '#ffffff']
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#001E00]/95 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-8 md:p-12 text-center shadow-[0_0_100px_rgba(163,220,243,0.2)] animate-in zoom-in-95 duration-500">
        
        <div className="w-20 h-20 bg-[#22c55e] rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-12 shadow-lg">
          <Crown className="h-10 w-10 text-[#001E00]" />
        </div>

        <h2 className="text-4xl font-black text-[#001E00] tracking-tighter mb-4 uppercase">
          Welcome to <span className="text-[#22c55e] bg-[#001E00] px-2">Pro Studio</span>
        </h2>
        
        <p className="text-gray-500 font-medium mb-10 leading-relaxed">
          Your infrastructure has been upgraded. You now have full access to our elite creator network and zero-fee marketplace.
        </p>

        <div className="space-y-4 mb-10">
          {[
            { icon: Zap, text: "0% Marketplace Transaction Fees" },
            { icon: Shield, text: "Verified Creator Access Unlocked" },
            { icon: Check, text: "Priority Support Line Active" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-left">
              <div className="h-8 w-8 rounded-full bg-[#22c55e]/20 flex items-center justify-center text-[#22c55e]">
                <item.icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-gray-700">{item.text}</span>
            </div>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="w-full py-5 bg-[#001E00] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#22c55e] hover:text-[#001E00] transition-all flex items-center justify-center gap-2"
        >
          Enter Pro Dashboard <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}