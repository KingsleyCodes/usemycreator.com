"use client";

import React, { useState, useEffect } from 'react';
import { Zap, Sparkles } from 'lucide-react';
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import UpgradeModal from './UpgradeModal'; 

export default function UpgradeTrigger() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    // We listen to the authenticated user's profile to track plan changes in real-time
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const unsubDoc = onSnapshot(doc(db, "users", user.uid), (snap) => {
          if (snap.exists()) {
            setPlan(snap.data().plan);
          }
        });
        return () => unsubDoc();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // ONLY show if the plan is explicitly 'marketplace'
  // This ensures it hides for Pro, Enterprise, and Admin roles automatically
  if (plan !== 'marketplace') return null;

  return (
    <>
      {/* Positioned at z-[60] to stay below the Navbar (z-70) 
        but above the page content.
      */}
      <div className="fixed top-24 right-4 sm:right-8 z-[60] animate-in slide-in-from-right duration-700">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group relative flex items-center gap-4 bg-black border border-[#a3dcf3]/30 p-1.5 pr-6 rounded-2xl hover:border-[#a3dcf3] transition-all shadow-2xl hover:scale-105 active:scale-95"
        >
          {/* Pulsing Glow Effect */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#a3dcf3] rounded-xl blur-md opacity-20 group-hover:opacity-60 animate-pulse" />
            <div className="relative h-11 w-11 rounded-xl bg-[#a3dcf3] flex items-center justify-center text-[#001E00]">
              <Zap className="h-5 w-5 fill-current" />
            </div>
          </div>

          <div className="text-left hidden xs:block">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a3dcf3] mb-0.5">Premium</p>
            <div className="flex items-center gap-2">
               <p className="text-xs font-black text-white uppercase tracking-tighter">Upgrade to Pro</p>
               <Sparkles className="h-3 w-3 text-[#a3dcf3]" />
            </div>
          </div>
          
          {/* Mobile Only View */}
          <div className="xs:hidden">
             <Sparkles className="h-4 w-4 text-[#a3dcf3]" />
          </div>
        </button>
      </div>

      <UpgradeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        planName="Pro Studio" 
      />
    </>
  );
}