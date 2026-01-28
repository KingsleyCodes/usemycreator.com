"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp,
  orderBy 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  Banknote, 
  User, 
  Search, 
  ShieldCheck,
  AlertCircle,
  ArrowLeft
} from "lucide-react";

export default function AdminPayouts() {
  const router = useRouter();
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // pending, completed

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/dashboard/admin/login");
        return;
      }

      // 1. Listen for Withdrawal Requests
      const q = query(
        collection(db, "withdrawals"), 
        where("status", "==", filter),
        orderBy("createdAt", "desc")
      );

      const unsubPayouts = onSnapshot(q, (snap) => {
        setPayouts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }, (err) => {
        console.error("Access Denied or Query Error:", err);
        setLoading(false);
      });

      return () => unsubPayouts();
    });

    return () => unsubscribe();
  }, [router, filter]);

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

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black text-white font-black uppercase text-[10px] tracking-widest animate-pulse">
      Securing Treasury Access...
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      
      {/* ADMIN HEADER */}
      <header className="border-b border-gray-100 p-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-4 transition-colors">
              <ArrowLeft className="h-3 w-3" /> Back to Terminal
            </button>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Treasury <span className="text-[#a3dcf3]">Settlement.</span></h1>
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

      <main className="max-w-7xl mx-auto p-8">
        {payouts.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
            <CheckCircle className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Treasury Queue is Empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {payouts.map((p) => (
              <div key={p.id} className="group bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:border-black transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                
                {/* CREATOR & AMOUNT */}
                <div className="flex items-center gap-6 flex-1">
                  <div className="h-16 w-16 bg-black rounded-2xl flex items-center justify-center text-[#a3dcf3] font-black text-xl">
                    {p.creatorName?.[0] || "C"}
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">{p.creatorName}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                       <Clock className="h-3 w-3" /> Requested {new Date(p.createdAt?.seconds * 1000).toLocaleDateString()}
                    </p>
                    <div className="mt-4 text-3xl font-black tracking-tighter">
                      ₦{p.amount?.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* BANK DETAILS BOX */}
                <div className="bg-gray-50 rounded-[2rem] p-6 flex-1 w-full lg:w-auto border border-transparent group-hover:border-[#a3dcf3]/30 transition-all">
                   <p className="text-[9px] font-black uppercase text-gray-400 mb-3 tracking-widest">Settlement Destination</p>
                   <div className="space-y-1">
                      <p className="text-sm font-black uppercase tracking-tight">{p.bankName}</p>
                      <p className="text-lg font-black font-mono text-black">{p.accountNumber}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{p.accountName}</p>
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

      {/* FOOTER STATS */}
      <footer className="fixed bottom-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-100 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-8">
            <div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Active Requests</p>
              <p className="font-black">{payouts.length}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Total Liability</p>
              <p className="font-black text-red-500">₦{payouts.reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic">
            UseMyCreator Treasury v1.0
          </div>
        </div>
      </footer>
    </div>
  );
}