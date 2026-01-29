"use client";

import { useState } from "react";
import { useAdminData } from "../useAdminData";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  CheckCircle, 
  Clock, 
  Banknote, 
  ShieldCheck,
  ArrowLeft
} from "lucide-react";

export default function AdminPayouts() {
  const { payouts, loading } = useAdminData();
  const [filter, setFilter] = useState("pending"); // pending, completed

  // --- ACTIONS ---
  const markAsPaid = async (payoutId) => {
    const confirmPay = confirm("Have you manually transferred this money via your bank app? This will notify the creator.");
    if (!confirmPay) return;

    try {
      const payoutRef = doc(db, "withdrawals", payoutId);
      await updateDoc(payoutRef, {
        status: "completed",
        paidAt: serverTimestamp(),
      });
      alert("Payout marked as completed.");
    } catch (err) {
      alert("Error updating status.");
    }
  };

  // Logic to filter the data based on your toggle
  const filteredPayouts = payouts.filter(p => p.status === filter);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center text-black font-black uppercase text-[10px] tracking-widest animate-pulse">
      Securing Treasury Access...
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-32">
      
      {/* ADMIN HEADER */}
      <header className="border-b border-gray-100 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">
              Treasury <span className="text-[#a3dcf3]">Settlement.</span>
            </h1>
          </div>

          <div className="flex bg-gray-100 p-1.5 rounded-2xl">
            <button 
              onClick={() => setFilter("pending")}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === "pending" ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-black"}`}
            >
              Pending Requests
            </button>
            <button 
              onClick={() => setFilter("completed")}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === "completed" ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-black"}`}
            >
              Payout History
            </button>
          </div>
        </div>
      </header>

      <main className="p-8">
        {filteredPayouts.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
            <CheckCircle className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
              {filter === "pending" ? "Treasury Queue is Empty" : "No Payout History Found"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPayouts.map((p) => (
              <div key={p.id} className="group bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:border-black transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 animate-in fade-in slide-in-from-bottom-2">
                
                {/* CREATOR & AMOUNT */}
                <div className="flex items-center gap-6 flex-1">
                  <div className="h-16 w-16 bg-black rounded-2xl flex items-center justify-center text-[#a3dcf3] font-black text-xl shadow-lg shadow-black/10">
                    {p.creatorName?.[0] || "C"}
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">{p.creatorName}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                       <Clock className="h-3 w-3" /> Requested {p.createdAt?.seconds ? new Date(p.createdAt.seconds * 1000).toLocaleDateString() : "Recently"}
                    </p>
                    <div className="mt-4 text-3xl font-black tracking-tighter text-[#108a00]">
                      ₦{p.amount?.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* BANK DETAILS BOX (Your Style) */}
                <div className="bg-gray-50 rounded-[2rem] p-6 flex-1 w-full lg:w-auto border border-transparent group-hover:border-[#a3dcf3]/30 transition-all">
                   <p className="text-[9px] font-black uppercase text-gray-400 mb-3 tracking-widest">Settlement Destination</p>
                   <div className="space-y-1">
                      <p className="text-sm font-black uppercase tracking-tight">{p.bankName || p.bankDetails?.bankName}</p>
                      <p className="text-lg font-black font-mono text-black">{p.accountNumber || p.bankDetails?.accountNumber}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{p.accountName || p.bankDetails?.accountName}</p>
                   </div>
                </div>

                {/* ACTION BUTTON */}
                <div className="w-full lg:w-auto">
                  {p.status === "pending" ? (
                    <button 
                      onClick={() => markAsPaid(p.id)}
                      className="w-full lg:w-auto bg-black text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#a3dcf3] hover:text-black transition-all shadow-xl shadow-black/5 flex items-center justify-center gap-2"
                    >
                      <Banknote className="h-4 w-4" /> Confirm Manual Transfer
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-6 py-4 rounded-2xl">
                       <ShieldCheck className="h-4 w-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Settled</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER STATS (Floating within the main area) */}
      <footer className="fixed bottom-24 lg:bottom-6 right-6 lg:right-10 left-6 lg:left-auto bg-black text-white p-6 rounded-3xl shadow-2xl flex items-center gap-10 border border-white/10 z-50">
          <div>
            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Queue</p>
            <p className="font-black text-xl">{filteredPayouts.length}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Liability</p>
            <p className="font-black text-xl text-[#a3dcf3]">₦{filteredPayouts.reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString()}</p>
          </div>
      </footer>
    </div>
  );
}