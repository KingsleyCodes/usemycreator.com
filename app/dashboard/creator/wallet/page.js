"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function CreatorWallet() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Withdrawal States
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      // 1. Listen to Creator Profile for Real-time Balance
      const unsubProfile = onSnapshot(doc(db, "creators", user.uid), (snap) => {
        if (snap.exists()) {
          setUserData(snap.data());
        }
      });

      // 2. Fetch Transaction History
      const transQuery = query(
        collection(db, "transactions"),
        where("creatorId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const unsubTrans = onSnapshot(transQuery, (snap) => {
        setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      // 3. Calculate Pending Escrow (Active campaigns that are funded but not released)
      const pendingQuery = query(
        collection(db, "chats"),
        where("creatorId", "==", user.uid),
        where("paymentStatus", "==", "escrow_locked")
      );
      const unsubPending = onSnapshot(pendingQuery, (snap) => {
        const total = snap.docs.reduce((acc, doc) => acc + (doc.data().budget || 0), 0);
        setPendingAmount(total);
        setLoading(false);
      });

      return () => {
        unsubProfile();
        unsubTrans();
        unsubPending();
      };
    });

    return () => unsubscribe();
  }, [router]);

  const handleWithdraw = async () => {
    const amount = Number(withdrawalAmount);
    if (amount <= 0 || amount > (userData?.balance || 0)) {
      return alert("Invalid amount or insufficient balance.");
    }

    setIsWithdrawing(true);
    try {
      // 1. Create a "payout_request" transaction
      await addDoc(collection(db, "transactions"), {
        creatorId: auth.currentUser.uid,
        creatorName: userData.name,
        amount: amount,
        type: "withdrawal_pending",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      alert("Withdrawal request sent! Our team will process it within 24 hours.");
      setWithdrawalAmount("");
      setShowWithdrawModal(false);
    } catch (err) {
      console.error("Withdrawal error:", err);
      alert("Request failed.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-black"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-20 font-sans relative">
      
      {/* WITHDRAWAL MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-black mb-2 tracking-tighter">Withdraw Funds</h2>
            <p className="text-gray-400 text-sm mb-6 font-medium">Your available balance is ₦{userData?.balance?.toLocaleString()}</p>
            
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">₦</span>
              <input 
                type="number"
                className="w-full p-5 pl-10 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-[#a3dcf3] font-black text-xl transition-all"
                placeholder="0.00"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowWithdrawModal(false)} 
                className="flex-1 font-black text-xs uppercase text-gray-400 hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="flex-[2] bg-black text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#a3dcf3] hover:text-black transition-all disabled:opacity-50"
              >
                {isWithdrawing ? "Processing..." : "Confirm Payout"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <nav className="p-6 flex justify-between items-center max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-black transition-colors font-black text-xs uppercase tracking-widest flex items-center gap-2">
          ← Back
        </button>
        <h1 className="text-sm font-black uppercase tracking-[0.3em]">My Wallet</h1>
        <div className="w-10" /> {/* Spacer */}
      </nav>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        {/* BALANCE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* MAIN BALANCE */}
          <div className="bg-black rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#a3dcf3] opacity-10 rounded-full -mr-10 -mt-10" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Available Balance</p>
            <h2 className="text-5xl font-black tracking-tighter mb-8">
              ₦{(userData?.balance || 0).toLocaleString()}
            </h2>
            <button 
              onClick={() => setShowWithdrawModal(true)}
              className="w-full bg-[#a3dcf3] text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all"
            >
              Withdraw Funds
            </button>
          </div>

          {/* PENDING BALANCE */}
          <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">In Escrow (Pending)</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">
              ₦{pendingAmount.toLocaleString()}
            </h2>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              These funds are locked in the MyCreator Escrow Protocol and will be released once the brand approves your work.
            </p>
          </div>
        </div>

        {/* TRANSACTION HISTORY */}
        <section>
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Transaction History</h3>
            <span className="text-[10px] font-bold text-gray-300 italic">Real-time updates</span>
          </div>

          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions.map((t) => {
                const isWithdrawal = t.type === "withdrawal_pending";
                return (
                  <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-gray-50 flex justify-between items-center hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${isWithdrawal ? "bg-orange-50 text-orange-500" : "bg-green-50 text-green-500"}`}>
                        {isWithdrawal ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-sm">
                          {isWithdrawal ? "Payout Request" : t.campaignTitle}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                          {t.createdAt?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-black ${isWithdrawal ? "text-orange-500" : "text-green-500"}`}>
                        {isWithdrawal ? "-" : "+"}₦{t.amount?.toLocaleString()}
                      </span>
                      <p className={`text-[10px] font-black uppercase ${isWithdrawal ? "text-orange-300" : "text-green-300"}`}>
                        {t.status || "Successful"}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest">No transactions yet</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}