"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { ShieldCheck, CreditCard, Lock, ArrowLeft } from "lucide-react";

export default function PaymentPage() {
  const { campaignId } = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState(null);
  const [processing, setProcessing] = useState(false);

  // 1. FETCH CAMPAIGN DATA ON LOAD
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!campaignId) return;
      
      try {
        const docRef = doc(db, "campaigns", campaignId);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
          setCampaign({ id: snap.id, ...snap.data() });
        } else {
          // If the campaign doesn't exist, send them back
          router.push("/dashboard/business");
        }
      } catch (err) {
        console.error("Error fetching campaign for payment:", err);
      }
    };
    
    fetchCampaign();
  }, [campaignId, router]);

  // 2. CALCULATE BUDGET AND FEES
  // Budget is pulled from Firestore, we add a 5% platform/escrow fee
  const platformFee = campaign ? campaign.budget * 0.05 : 0;
  const totalAmount = campaign ? campaign.budget + platformFee : 0;

  // 3. INTEGRATED PAYSTACK POPUP HANDLER
  const handlePayment = () => {
    // Safety check: ensure the Paystack script from layout.js is loaded
    if (!window.PaystackPop) {
      alert("Payment processor is still loading. Please wait a few seconds and try again.");
      return;
    }

    setProcessing(true);

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY, // Pulled from your .env.local
      email: auth.currentUser?.email,
      amount: Math.round(totalAmount * 100), // MUST be an integer in Kobo
      currency: "NGN",
      metadata: {
        campaignId: campaign.id,
        businessId: auth.currentUser?.uid,
        totalWithFee: totalAmount,
      },
      callback: function (response) {
        // SUCCESS: The money is now with Paystack.
        // The Webhook (api/paystack/webhook/route.js) will handle the 
        // database update to 'escrow_locked' for security.
        setProcessing(false);
        router.push(`/dashboard/business/pay/success?ref=${response.reference}`);
      },
      onClose: function () {
        // CANCELLED: The user closed the window without paying
        setProcessing(false);
        alert("Transaction cancelled. No funds were debited from your account.");
      },
    });

    handler.openIframe();
  };

  // 4. LOADING STATE
  if (!campaign) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 border-4 border-t-black border-gray-200 rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Generating Secure Invoice...</p>
      </div>
    </div>
  );

  // 5. MAIN UI
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
      
      {/* Back Navigation */}
      <button 
        onClick={() => router.back()}
        className="mb-8 flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400 hover:text-black transition-all"
      >
        <ArrowLeft className="h-3 w-3" /> Return to Studio
      </button>

      {/* Payment Card */}
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-8 md:p-12 relative overflow-hidden">
        
        {/* Decorative Shield Icon */}
        <div className="absolute top-0 right-0 p-8">
          <ShieldCheck className="h-8 w-8 text-emerald-500 opacity-10" />
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-6 border border-emerald-100">
            <Lock className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Secure Escrow</h1>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">
            Invoice Ref: {campaign.id.substring(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Invoice Summary Box */}
        <div className="bg-gray-50 rounded-[2.5rem] p-8 mb-10 border border-gray-100">
          <div className="space-y-5">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400 font-bold uppercase tracking-widest">Base Campaign Budget</span>
              <span className="font-black text-gray-900 font-mono">₦{campaign.budget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400 font-bold uppercase tracking-widest">Escrow Service Fee (5%)</span>
              <span className="font-black text-gray-900 font-mono">₦{platformFee.toLocaleString()}</span>
            </div>
            
            {/* Divider */}
            <div className="h-[1px] bg-gray-200 w-full" />
            
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-900 font-black uppercase text-xs tracking-tighter">Total Deposit</span>
              <span className="text-4xl font-black text-gray-900 tracking-tight">
                ₦{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handlePayment}
          disabled={processing}
          className="w-full bg-black text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#a3dcf3] hover:text-black transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl active:scale-95"
        >
          {processing ? (
            <span className="animate-pulse">Initializing Terminal...</span>
          ) : (
            <>
              <CreditCard className="h-4 w-4" /> Initialize Secure Payment
            </>
          )}
        </button>
        
        {/* Trust Footer */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
             <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
             <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
              Live Escrow Node Active
            </p>
          </div>
          <p className="text-[8px] text-gray-300 font-medium text-center px-4">
            Funds are locked in a neutral account and released only after content approval.
          </p>
        </div>
      </div>
    </div>
  );
}