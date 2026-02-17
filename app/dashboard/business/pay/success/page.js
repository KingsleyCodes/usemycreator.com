"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  CheckCircle2, 
  ArrowRight, 
  PartyPopper, 
  ShieldCheck, 
  X, 
  Loader2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reference, setReference] = useState("");

  useEffect(() => {
    const ref = searchParams.get("ref") || searchParams.get("reference");
    if (ref) {
      setReference(ref);
    }
  }, [searchParams]);

  return (
    <div className="max-w-md w-full text-center relative z-10 animate-in fade-in zoom-in-95 duration-700">
      {/* SUCCESS ICON */}
      <div className="mb-8 relative inline-block">
        <div className="h-24 w-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
          <CheckCircle2 className="w-12 h-12 animate-in zoom-in duration-500 delay-200" />
        </div>
        <div className="absolute -top-2 -right-2">
          <PartyPopper className="h-8 w-8 text-[#22c55e] animate-bounce" />
        </div>
      </div>

      {/* TEXT CONTENT */}
      <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-4">
        Escrow <span className="text-emerald-500">Secured.</span>
      </h1>
      <p className="text-gray-500 text-sm leading-relaxed mb-10 px-4">
        Your campaign budget has been successfully locked. 
        Creators are being notified and can now begin applying to your brief.
      </p>

      {/* TRANSACTION SUMMARY BOX */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 mb-10 text-left shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Security Receipt</span>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Payment Status</span>
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold text-[9px] uppercase border border-emerald-100">
              Verified & Locked
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Reference ID</span>
            <span className="text-[10px] font-mono font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded">
              {reference || "REF-PROCESSING"}
            </span>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/dashboard/business"
          className="w-full bg-black text-white py-5 rounded-full font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-xl group"
        >
          Go to Dashboard <ArrowRight className="h-4 w-4 text-[#22c55e] group-hover:translate-x-1 transition-transform" />
        </Link>
        
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">
          A confirmation email has been sent to your inbox
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#001E00] font-sans antialiased relative overflow-hidden">
      
      {/* STICKY NAV WITH EXIT ICON */}
      <nav className="h-14 md:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/dashboard/business")}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-gray-500 hover:text-black"
            aria-label="Exit"
          >
            <X className="h-5 w-5" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Campaign Launched</span>
        </div>

        <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live in Marketplace</span>
            </div>
        </div>
      </nav>

      {/* DECORATIVE BACKGROUND ELEMENTS */}
      <div className="absolute top-[10%] left-[-5%] w-[30%] h-[30%] bg-[#22c55e] opacity-[0.03] rounded-full blur-[100px]" />
      <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-emerald-500 opacity-[0.03] rounded-full blur-[100px]" />

      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6">
        <Suspense fallback={
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#22c55e] mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Finalizing Receipt...</p>
          </div>
        }>
          <SuccessContent />
        </Suspense>

        {/* FOOTER LOGO */}
        <div className="mt-16 opacity-20">
          <span className="text-gray-900 font-serif font-black text-xl italic uppercase tracking-tighter">mycreator.</span>
        </div>
      </main>
    </div>
  );
}