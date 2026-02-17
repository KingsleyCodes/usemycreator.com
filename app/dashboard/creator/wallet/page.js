"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  doc, 
  onSnapshot,
  orderBy,
  runTransaction,
  serverTimestamp,
  increment
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  ArrowLeft, 
  Wallet, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  X,
  CreditCard,
  Building2,
  User as UserIcon,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle
} from "lucide-react";

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
  const [withdrawalStep, setWithdrawalStep] = useState(1); // 1: Form, 2: Success
  
  // Bank details synced from profile
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    bankCode: ""
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      // 1. Listen to Creator Profile for Real-time Balance & Bank Details
      const unsubProfile = onSnapshot(doc(db, "creators", user.uid), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          if (data.bankDetails) {
            setBankDetails(data.bankDetails);
          }
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

      // 3. Calculate Pending Escrow
      const pendingQuery = query(
        collection(db, "campaigns"),
        where("assignedCreatorId", "==", user.uid),
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

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawalAmount);

    if (amount < 1000) return alert("Minimum withdrawal is ₦1,000");
    if (amount > (userData?.balance || 0)) return alert("Insufficient balance.");
    if (!bankDetails.accountNumber || !bankDetails.bankName) {
      alert("Please set up your verified bank details in Settings first.");
      router.push("/dashboard/creator/settings");
      return;
    }

    setIsWithdrawing(true);
    try {
      const creatorRef = doc(db, "creators", auth.currentUser.uid);
      const withdrawalRef = doc(collection(db, "withdrawals"));
      const transactionRef = doc(collection(db, "transactions"));

      await runTransaction(db, async (transaction) => {
        const creatorDoc = await transaction.get(creatorRef);
        if (!creatorDoc.exists()) throw "Profile not found";
        
        const currentBal = creatorDoc.data().balance || 0;
        if (currentBal < amount) throw "Insufficient funds";

        // 1. Atomic deduction from balance
        transaction.update(creatorRef, {
          balance: increment(-amount)
        });

        // 2. Create the Payout Request for Admin
        transaction.set(withdrawalRef, {
          creatorId: auth.currentUser.uid,
          creatorName: userData.name,
          amount: amount,
          bankName: bankDetails.bankName,
          accountNumber: bankDetails.accountNumber,
          accountName: bankDetails.accountName,
          bankCode: bankDetails.bankCode || "",
          status: "pending",
          createdAt: serverTimestamp()
        });

        // 3. Log the pending withdrawal in transaction history
        transaction.set(transactionRef, {
          creatorId: auth.currentUser.uid,
          amount: amount,
          type: "withdrawal_pending",
          status: "pending",
          createdAt: serverTimestamp()
        });
      });

      setWithdrawalStep(2);
      setWithdrawalAmount("");
    } catch (err) {
      console.error("Withdrawal error:", err);
      alert("Request failed: " + err);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const closeWithdrawalModal = () => {
    setShowWithdrawModal(false);
    setWithdrawalStep(1);
    setWithdrawalAmount("");
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white text-black font-black uppercase text-[10px] tracking-widest animate-pulse">
      Syncing Ledger...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20 font-sans selection:bg-[#22c55e]">
      
      {/* WITHDRAWAL MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white p-10 rounded-[3rem] max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={closeWithdrawalModal} 
              className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {withdrawalStep === 1 ? (
              <>
                <h2 className="text-3xl font-black mb-2 tracking-tighter uppercase italic">Request <span className="text-[#22c55e]">Payout.</span></h2>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-8">Verified Settlement Terminal</p>
                
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div className="relative">
                    <p className="text-[9px] font-black uppercase text-gray-400 mb-2 ml-2 tracking-widest">Amount to Withdraw (₦)</p>
                    <input 
                      type="number"
                      required
                      className="w-full p-6 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#22c55e] font-black text-2xl transition-all"
                      placeholder="0.00"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                    />
                  </div>

                  <div className="pt-4">
                    <p className="text-[9px] font-black uppercase text-gray-400 ml-2 mb-3 tracking-widest">Verified Payout Destination</p>
                    
                    {bankDetails.accountNumber ? (
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-6">
                        <div className="flex items-center gap-2 mb-4">
                           <ShieldCheck className="h-4 w-4 text-emerald-500" />
                           <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Verified Account</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-black uppercase tracking-tight text-emerald-900">{bankDetails.bankName}</p>
                          <p className="text-lg font-black font-mono text-emerald-700">{bankDetails.accountNumber}</p>
                          <p className="text-[10px] font-bold text-emerald-600/60 uppercase">{bankDetails.accountName}</p>
                        </div>
                      </div>
                    ) : (
                      <div onClick={() => router.push('/dashboard/creator/settings')} className="bg-red-50 border border-red-100 rounded-[2rem] p-6 cursor-pointer hover:bg-red-100 transition-colors">
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <p className="text-[10px] font-black uppercase tracking-widest">No Bank Details Found</p>
                        </div>
                        <p className="text-[9px] font-bold text-red-400 uppercase mt-1">Tap to set up your payout bank</p>
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit"
                    disabled={isWithdrawing || !bankDetails.accountNumber}
                    className="w-full bg-black text-white py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#22c55e] hover:text-black transition-all disabled:opacity-20 mt-4 shadow-xl flex items-center justify-center gap-2"
                  >
                    {isWithdrawing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Withdrawal"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Request <span className="text-emerald-500">Logged.</span></h2>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                  Treasury has received your request. Funds typically arrive within 24-48 business hours.
                </p>
                <button 
                  onClick={closeWithdrawalModal}
                  className="mt-10 text-[10px] font-black uppercase underline tracking-[0.2em] hover:text-[#22c55e] transition-colors"
                >
                  Return to Ledger
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
      <nav className="p-8 flex justify-between items-center max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white border border-gray-100 hover:border-black transition-all shadow-sm">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
            <h1 className="text-xs font-black uppercase tracking-[0.4em] text-gray-400">Ledger</h1>
            <p className="text-[9px] font-bold text-gray-300 uppercase italic">Capital Management</p>
        </div>
        <div className="w-12" />
      </nav>

      <main className="max-w-5xl mx-auto px-6">
        
        {/* BALANCE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-black rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#22c55e] opacity-5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:opacity-10 transition-opacity" />
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 opacity-50">
                    <Wallet className="h-4 w-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Available Funds</p>
                </div>
                <h2 className="text-6xl font-black tracking-tighter mb-10 italic">
                  ₦{(userData?.balance || 0).toLocaleString()}
                </h2>
                <button 
                  onClick={() => setShowWithdrawModal(true)}
                  className="w-full bg-[#22c55e] text-black py-5 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  Withdrawal Terminal <ArrowUpRight className="h-4 w-4" />
                </button>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-50 rounded-[3.5rem] p-12 flex flex-col justify-between group hover:border-[#22c55e]/30 transition-all">
            <div>
                <div className="flex items-center gap-2 mb-4 opacity-50">
                    <Clock className="h-4 w-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Escrow Locked</p>
                </div>
                <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-4 italic">
                  ₦{pendingAmount.toLocaleString()}
                </h2>
            </div>
            <p className="text-[11px] text-gray-400 font-bold leading-relaxed uppercase tracking-tighter opacity-60">
              Funds are protected in our smart ledger and released automatically when brands approve your deliverables.
            </p>
          </div>
        </div>

        {/* TRANSACTION HISTORY */}
        <section>
          <div className="flex justify-between items-center mb-8 px-4">
            <h3 className="text-xs font-black text-black uppercase tracking-[0.2em]">Activity Log</h3>
            <div className="h-[1px] flex-1 bg-gray-100 mx-6" />
          </div>

          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.map((t) => {
                const isWithdrawal = t.type?.includes("withdrawal");
                return (
                  <div key={t.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-50 flex justify-between items-center hover:translate-x-2 transition-all">
                    <div className="flex items-center gap-6">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${isWithdrawal ? "bg-orange-50 text-orange-500" : "bg-emerald-50 text-emerald-600"}`}>
                        {isWithdrawal ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownLeft className="h-6 w-6" />}
                      </div>
                      <div>
                        <h4 className="font-black text-black text-sm uppercase tracking-tight">
                          {isWithdrawal ? "Payout Request" : (t.campaignTitle || "Deposit Received")}
                        </h4>
                        <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">
                          {t.createdAt?.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-black italic ${isWithdrawal ? "text-orange-500" : "text-emerald-600"}`}>
                        {isWithdrawal ? "-" : "+"} ₦{t.amount?.toLocaleString()}
                      </span>
                      <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${t.status === 'pending' ? 'text-orange-300' : 'text-emerald-400'}`}>
                        {t.status || "Success"}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-24 text-center bg-white border-2 border-dashed border-gray-100 rounded-[3rem]">
                <p className="text-gray-300 text-[10px] font-black uppercase tracking-[0.3em]">No financial activity found</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}