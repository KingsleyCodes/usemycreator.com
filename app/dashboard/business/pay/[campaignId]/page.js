"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function PaymentPage() {
  const { campaignId } = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      const docRef = doc(db, "campaigns", campaignId);
      const snap = await getDoc(docRef);
      if (snap.exists()) setCampaign(snap.data());
    };
    fetchCampaign();
  }, [campaignId]);

  const handlePayment = async () => {
    setProcessing(true);
    // 💡 Simulation: Wait 2 seconds to "process" payment
    setTimeout(async () => {
      try {
        await updateDoc(doc(db, "campaigns", campaignId), {
          paymentStatus: "escrow_locked",
          status: "active"
        });
        router.push("/dashboard/business");
      } catch (err) {
        alert("Payment failed to sync.");
      } finally {
        setProcessing(false);
      }
    }, 2000);
  };

  if (!campaign) return <div className="p-20 text-center font-black">Loading Invoice...</div>;

  const platformFee = campaign.budget * 0.05; // 5% Fee
  const totalAmount = campaign.budget + platformFee;

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-10">
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Secure Escrow Deposit</h1>
          <p className="text-gray-400 text-sm font-medium">Funds will be held safely until work is approved.</p>
        </div>

        <div className="space-y-4 mb-10">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-bold uppercase">Campaign Budget</span>
            <span className="font-black text-gray-900">₦{campaign.budget.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-bold uppercase">Service Fee (5%)</span>
            <span className="font-black text-gray-900">₦{platformFee.toLocaleString()}</span>
          </div>
          <div className="h-[1px] bg-gray-100 my-4" />
          <div className="flex justify-between items-center">
            <span className="text-gray-900 font-black uppercase text-xs">Total to Deposit</span>
            <span className="text-3xl font-black text-gray-900">₦{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <button 
          onClick={handlePayment}
          disabled={processing}
          className="w-full bg-black text-white py-6 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {processing ? "LOCKING FUNDS..." : "CONFIRM & DEPOSIT"}
        </button>
        
        <p className="text-[10px] text-center text-gray-300 font-bold uppercase mt-6 tracking-widest">
          Secured by MyCreator Escrow Node
        </p>
      </div>
    </div>
  );
}