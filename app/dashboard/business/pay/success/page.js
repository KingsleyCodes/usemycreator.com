"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, PartyPopper, ShieldCheck } from "lucide-react";
import Link from "next/link";

// 1. Move your UI into this sub-component
function SuccessContent() {
  const searchParams = useSearchParams();
  const [reference, setReference] = useState("");

  useEffect(() => {
    const ref = searchParams.get("ref") || searchParams.get("reference");
    if (ref) {
      setReference(ref);
    }
  }, [searchParams]);

  return (
    <div className="max-w-md w-full text-center relative z-10">
      {/* SUCCESS ICON ANIMATION */}
      <div className="mb-8 relative inline-block">
        <div className="h-24 w-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto border border-emerald-100 shadow-sm animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="absolute -top-2 -right-2">
          <PartyPopper className="h-8 w-8 text-amber-400 animate-pulse" />
        </div>
      </div>

      {/* TEXT CONTENT */}
      <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase mb-4">
        Escrow <span className="text-emerald-500">Secured.</span>
      </h1>
      <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10 px-4">
        Your campaign budget has been successfully locked in escrow. 
        Creators can now see your brief and begin applying.
      </p>

      {/* TRANSACTION SUMMARY BOX */}
      <div className="bg-gray-50 rounded-[2rem] border border-gray-100 p-6 mb-10 text-left">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Security Receipt</span>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-gray-900">Status</span>
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold text-[9px] uppercase">Verified</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-gray-900">Reference</span>
            <span className="text-[10px] font-mono font-bold text-gray-500">{reference || "PAY-REF-PENDING"}</span>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/dashboard/business"
          className="w-full bg-black text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#a3dcf3] hover:text-black transition-all shadow-xl group"
        >
          Go to Dashboard <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
          A confirmation email has been sent to your business address
        </p>
      </div>
    </div>
  );
}

// 2. The main export wraps everything in Suspense
export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#a3dcf3] opacity-5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100 opacity-10 rounded-full blur-[120px]" />

      <Suspense fallback={
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-300 animate-pulse">
          Loading Security Receipt...
        </div>
      }>
        <SuccessContent />
      </Suspense>

      {/* FOOTER LOGO */}
      <div className="mt-20">
        <span className="text-gray-200 font-black tracking-tighter text-xl italic uppercase">mycreator.</span>
      </div>
    </div>
  );
}