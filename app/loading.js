"use client";

import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
      {/* Brand Spinner */}
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute h-16 w-16 rounded-full border-4 border-gray-100 border-t-[#108a00] animate-spin" />
        
        {/* Inner Pulse */}
        <div className="h-10 w-10 bg-[#108a00] rounded-xl animate-pulse shadow-lg shadow-[#108a00]/20 flex items-center justify-center">
            <span className="text-white font-black text-[10px]">UMC</span>
        </div>
      </div>

      {/* Loading Text */}
      <div className="mt-8 flex flex-col items-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse">
            Syncing Environment
        </p>
        <div className="mt-2 flex gap-1">
            <div className="h-1 w-1 bg-[#108a00] rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="h-1 w-1 bg-[#108a00] rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="h-1 w-1 bg-[#108a00] rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}