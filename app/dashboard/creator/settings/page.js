"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function BankSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Bank States
  const [bankData, setBankData] = useState({
    accountName: "",
    accountNumber: "",
    bankName: ""
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch existing bank details if they exist
      const userDoc = await getDoc(doc(db, "creators", user.uid));
      if (userDoc.exists() && userDoc.data().bankDetails) {
        setBankData(userDoc.data().bankDetails);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const userRef = doc(db, "creators", auth.currentUser.uid);
      await updateDoc(userRef, {
        bankDetails: bankData
      });
      alert("Bank details updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-xs">Loading Secure Vault...</div>;

  return (
    <div className="min-h-screen bg-[#fcfcfc] p-6 font-sans">
      <nav className="max-w-xl mx-auto mb-12">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-black font-black text-[10px] uppercase tracking-widest transition-colors">
          ← Return to Wallet
        </button>
      </nav>

      <main className="max-w-xl mx-auto bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50">
        <header className="mb-10 text-center">
          <div className="h-16 w-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">Payout Settings</h1>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Where should we send your money?</p>
        </header>

        <form onSubmit={saveSettings} className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 mb-2 block">Account Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Tobi Adeyemi"
              className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-black transition-all"
              value={bankData.accountName}
              onChange={(e) => setBankData({...bankData, accountName: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 mb-2 block">Account Number</label>
              <input 
                required
                type="text" 
                maxLength="10"
                placeholder="0123456789"
                className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-black transition-all"
                value={bankData.accountNumber}
                onChange={(e) => setBankData({...bankData, accountNumber: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 mb-2 block">Bank Name</label>
              <input 
                required
                type="text" 
                placeholder="e.g. GTBank"
                className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-black transition-all"
                value={bankData.bankName}
                onChange={(e) => setBankData({...bankData, bankName: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#a3dcf3] hover:text-black transition-all disabled:opacity-50 mt-4"
          >
            {saving ? "Encrypting & Saving..." : "Update Bank Details"}
          </button>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-2xl flex gap-4">
          <div className="text-blue-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
          </div>
          <p className="text-[10px] text-blue-700 font-bold leading-relaxed uppercase">
            Double check your account number. Payments sent to wrong accounts cannot be reversed.
          </p>
        </div>
      </main>
    </div>
  );
}