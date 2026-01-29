"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  X, 
  Loader2, 
  CheckCircle2, 
  Info,
  Twitter,
  LogOut 
} from "lucide-react";

export default function PaymentPage() {
  const { campaignId } = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!campaignId) return;
      try {
        const docRef = doc(db, "campaigns", campaignId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setCampaign({ id: snap.id, ...snap.data() });
        } else {
          router.push("/dashboard/business");
        }
      } catch (err) {
        console.error("Error fetching campaign for payment:", err);
      }
    };
    fetchCampaign();
  }, [campaignId, router]);

  const platformFee = campaign ? campaign.budget * 0.05 : 0;
  const totalAmount = campaign ? campaign.budget + platformFee : 0;

  const handlePayment = () => {
    if (!window.PaystackPop) {
      alert("Payment processor is still loading...");
      return;
    }
    setProcessing(true);
    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY, 
      email: auth.currentUser?.email,
      amount: Math.round(totalAmount * 100), 
      currency: "NGN",
      metadata: { campaignId: campaign.id, businessId: auth.currentUser?.uid, totalWithFee: totalAmount },
      callback: function (response) {
        setProcessing(false);
        router.push(`/dashboard/business/pay/success?ref=${response.reference}`);
      },
      onClose: function () {
        setProcessing(false);
      },
    });
    handler.openIframe();
  };

  if (!campaign) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="h-10 w-10 animate-spin text-[#a3dcf3]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#001E00] font-sans antialiased">
      {/* STICKY NAV WITH EXIT ICON */}
      <nav className="h-14 md:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/dashboard/business")}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-gray-500 hover:text-black"
            aria-label="Exit and return to dashboard"
          >
            <X className="h-5 w-5" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Secure Checkout</span>
        </div>

        <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Encrypted Session</span>
            </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8 md:py-16 flex flex-col items-center">
        {/* Payment Card */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          
          <div className="h-1.5 w-full bg-[#a3dcf3]/10">
            <div className="h-full bg-[#a3dcf3] w-full animate-in slide-in-from-left duration-1000"></div>
          </div>

          <div className="p-6 md:p-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Escrow Protection Active</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-serif font-medium text-gray-900">Finalize Deposit</h1>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                  ID: {campaign.id.substring(0, 12).toUpperCase()}
                </p>
              </div>
              <div className="h-12 w-12 bg-[#F9FAFB] border border-gray-100 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-gray-900" />
              </div>
            </div>

            {/* Campaign Summary Box */}
            <div className="mb-8 bg-[#F9FAFB] border border-gray-100 rounded-xl p-4 md:p-6 flex items-center justify-between">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="h-10 w-10 bg-black rounded-lg flex items-center justify-center text-[#a3dcf3] shrink-0">
                  {campaign.platform === "Twitter" ? <Twitter className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1 text-nowrap">Briefing</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{campaign.title}</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">Platform</p>
                <p className="text-sm font-bold text-gray-900">{campaign.platform}</p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-4 mb-10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Project Budget</span>
                <span className="font-bold">₦{campaign.budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 flex items-center gap-1.5">
                  Escrow Fee (5%) <Info className="h-3 w-3 text-gray-300" />
                </span>
                <span className="font-bold">₦{platformFee.toLocaleString()}</span>
              </div>
              
              <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">Total to Secure</p>
                  <p className="text-gray-400 text-[9px] leading-tight max-w-[140px]">Released only on approval.</p>
                </div>
                <span className="text-3xl md:text-4xl font-serif font-medium text-gray-900">
                  ₦{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button 
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-black text-white py-4 md:py-5 rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#a3dcf3]" />
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 text-[#a3dcf3]" /> Pay via Paystack
                  </>
                )}
              </button>
              
              <button 
                onClick={() => router.back()}
                className="w-full py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-all"
              >
                Go back & edit details
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-8 flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-4 opacity-50 grayscale">
                <img src="/paystack-logo.png" alt="Paystack" className="h-4" />
            </div>
            <p className="text-[10px] text-gray-400 max-w-xs leading-relaxed">
                UseMyCreator uses bank-level encryption. Your payment details are never stored on our servers.
            </p>
        </div>
      </main>
    </div>
  );
}