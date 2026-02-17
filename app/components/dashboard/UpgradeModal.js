"use client";

import React, { useState, useEffect } from 'react';
import { Zap, Sparkles, Crown, ShieldCheck } from 'lucide-react';
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import UpgradeModal from './UpgradeModal'; 

export default function UpgradeTrigger() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    // 1. Set up Auth listener to ensure user is loaded
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // 2. Real-time listener for plan changes
        const unsubDoc = onSnapshot(doc(db, "users", user.uid), (snap) => {
          if (snap.exists()) {
            setPlan(snap.data().plan);
          }
        });
        return () => unsubDoc(); // Clean up Firestore listener
      } else {
        setPlan(null);
      }
    });

    return () => unsubscribeAuth(); // Clean up Auth listener
  }, []);

  // MASTER RULE: If they are 'enterprise' or 'Owner', hide everything to keep UI clean
  if (plan === 'enterprise' || plan === 'Owner') return null;

  // STATE A: THE PRO STATUS (Non-clickable Status Badge)
  if (plan === 'pro') {
    return (
      <div className="fixed top-24 right-4 sm:right-8 z-[60] animate-in slide-in-from-top duration-1000">
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-gray-200 p-1.5 pr-5 rounded-2xl shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-[#001E00] flex items-center justify-center text-[#22c55e]">
            <Crown className="h-5 w-5 fill-current" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Account Tier</p>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-black text-[#001E00] uppercase">Pro Studio</p>
              <ShieldCheck className="h-3 w-3 text-[#22c55e]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STATE B: THE UPGRADE PROMPT (Clickable)
  if (plan === 'marketplace') {
    return (
      <>
        <div className="fixed top-24 right-4 sm:right-8 z-[60] animate-in slide-in-from-right duration-700">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group relative flex items-center gap-4 bg-black border border-[#22c55e]/30 p-1.5 pr-6 rounded-2xl hover:border-[#22c55e] transition-all shadow-2xl hover:scale-105 active:scale-95"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#22c55e] rounded-xl blur-md opacity-20 group-hover:opacity-60 animate-pulse" />
              <div className="relative h-11 w-11 rounded-xl bg-[#22c55e] flex items-center justify-center text-[#001E00]">
                <Zap className="h-5 w-5 fill-current" />
              </div>
            </div>
            <div className="text-left hidden xs:block">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#22c55e] mb-0.5">Premium</p>
              <div className="flex items-center gap-2">
                 <p className="text-xs font-black text-white uppercase tracking-tighter">Upgrade to Pro</p>
                 <Sparkles className="h-3 w-3 text-[#22c55e]" />
              </div>
            </div>
          </button>
        </div>
        <UpgradeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} planName="Pro Studio" />
      </>
    );
  }

  return null;
}