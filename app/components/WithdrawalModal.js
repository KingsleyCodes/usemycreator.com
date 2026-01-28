"use client";

import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { X, Landmark, ArrowRight, Loader2, CheckCircle } from "lucide-react";

export default function WithdrawalModal({ isOpen, onClose, balance }) {
  const [amount, setAmount] = useState("");
  const [bankDetails, setBankDetails] = useState({ bankName: "", accountNumber: "", accountName: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Success

  if (!isOpen) return null;

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    const withdrawAmount = Number(amount);

    if (withdrawAmount < 1000) return alert("Minimum withdrawal is ₦1,000");
    if (withdrawAmount > balance) return alert("Insufficient balance.");

    setIsProcessing(true);
    try {
      const user = auth.currentUser;
      const creatorRef = doc(db, "creators", user.uid);

      await runTransaction(db, async (transaction) => {
        const creatorDoc = await transaction.get(creatorRef);
        const currentBalance = creatorDoc.data().balance || 0;

        if (currentBalance < withdrawAmount) throw "Insufficient funds";

        // 1. Deduct balance immediately (Escrow logic)
        transaction.update(creatorRef, {
          balance: increment(-withdrawAmount)
        });

        // 2. Create the Payout Request for the Admin
        const payoutRef = doc(collection(db, "payouts"));
        transaction.set(payoutRef, {
          creatorId: user.uid,
          creatorName: creatorDoc.data().name,
          amount: withdrawAmount,
          bankDetails,
          status: "pending",
          createdAt: serverTimestamp(),
        });
      });

      setStep(2);
    } catch (err) {
      console.error("Withdrawal Error:", err);
      alert("Failed to process request.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-black"><X /></button>

        {step === 1 ? (
          <form onSubmit={handleWithdrawal} className="space-y-5">
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Cash <span className="text-[#a3dcf3]">Out.</span></h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Available: ₦{balance.toLocaleString()}</p>
            </div>

            <div className="space-y-3">
              <input
                type="number"
                required
                placeholder="Amount (₦)"
                className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#a3dcf3]"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <input
                type="text"
                required
                placeholder="Bank Name"
                className="w-full p-4 bg-gray-50 rounded-xl text-sm font-bold outline-none"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
              />
              <input
                type="text"
                required
                placeholder="Account Number"
                className="w-full p-4 bg-gray-50 rounded-xl text-sm font-bold outline-none"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
              />
              <input
                type="text"
                required
                placeholder="Account Name"
                className="w-full p-4 bg-gray-50 rounded-xl text-sm font-bold outline-none"
                value={bankDetails.accountName}
                onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
              />
            </div>

            <button
              disabled={isProcessing}
              className="w-full bg-black text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#a3dcf3] hover:text-black transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : "Request Payout"}
            </button>
          </form>
        ) : (
          <div className="text-center py-10">
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase italic">Request Sent!</h3>
            <p className="text-sm text-gray-500 mt-2">Funds will arrive in your bank account within 24-48 hours.</p>
            <button onClick={onClose} className="mt-8 text-[10px] font-black uppercase underline tracking-widest">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}