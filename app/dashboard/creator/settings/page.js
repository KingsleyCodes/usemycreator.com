"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2, CheckCircle, AlertCircle, Building2, Search } from "lucide-react";

export default function BankSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  
  // Lists
  const [banks, setBanks] = useState([]);
  
  // Bank States
  const [bankData, setBankData] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    bankCode: ""
  });

  useEffect(() => {
    // 1. Fetch Nigerian Bank List for the dropdown
    const fetchBanks = async () => {
      try {
        const res = await fetch("https://api.paystack.co/bank");
        const data = await res.json();
        if (data.status) {
          setBanks(data.data);
        }
      } catch (err) {
        console.error("Failed to load banks", err);
      }
    };

    fetchBanks();

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

  // AUTO-VERIFICATION TRIGGER
  // When bankCode and accountNumber (10 digits) are present, verify
  useEffect(() => {
    const triggerVerification = async () => {
      if (bankData.accountNumber.length === 10 && bankData.bankCode) {
        setVerifying(true);
        setBankData(prev => ({ ...prev, accountName: "" })); // Clear name while verifying

        try {
          const response = await fetch(
            `/api/verify-bank?accountNumber=${bankData.accountNumber}&bankCode=${bankData.bankCode}`
          );
          const result = await response.json();

          if (result.accountName) {
            setBankData(prev => ({ ...prev, accountName: result.accountName }));
          } else {
            setBankData(prev => ({ ...prev, accountName: "Verification Failed" }));
          }
        } catch (error) {
          console.error("Verification error", error);
        } finally {
          setVerifying(false);
        }
      }
    };

    const timeoutId = setTimeout(triggerVerification, 500); // Debounce for 500ms
    return () => clearTimeout(timeoutId);
  }, [bankData.accountNumber, bankData.bankCode]);

  const saveSettings = async (e) => {
    e.preventDefault();
    
    if (bankData.accountName === "Verification Failed" || !bankData.accountName) {
      alert("Please ensure your bank details are verified before saving.");
      return;
    }

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
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">Payout <span className="text-[#a3dcf3]">Terminal.</span></h1>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Automatic Bank Verification</p>
        </header>

        <form onSubmit={saveSettings} className="space-y-6">
          
          {/* BANK SELECTION */}
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 mb-2 block">Choose Bank</label>
            <div className="relative">
              <select 
                required
                className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-black transition-all appearance-none cursor-pointer"
                value={bankData.bankCode}
                onChange={(e) => {
                  const selectedBank = banks.find(b => b.code === e.target.value);
                  setBankData({
                    ...bankData, 
                    bankCode: e.target.value, 
                    bankName: selectedBank ? selectedBank.name : ""
                  });
                }}
              >
                <option value="">Select a Nigerian Bank</option>
                {banks.map((bank) => (
                  <option key={bank.id} value={bank.code}>{bank.name}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* ACCOUNT NUMBER */}
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 mb-2 block">Account Number</label>
            <div className="relative">
              <input 
                required
                type="text" 
                maxLength="10"
                placeholder="0123456789"
                className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl font-mono font-bold outline-none focus:border-black transition-all"
                value={bankData.accountNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ''); // Numbers only
                  setBankData({...bankData, accountNumber: val});
                }}
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                {verifying && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
              </div>
            </div>
          </div>

          {/* ACCOUNT NAME (VERIFIED RESULT) */}
          <div className="relative">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 mb-2 block">Account Name (Auto-Verified)</label>
            <div className={`w-full p-5 rounded-2xl border-2 font-black text-sm flex items-center justify-between ${
              bankData.accountName && bankData.accountName !== "Verification Failed" 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-900' 
                : 'bg-gray-50 border-transparent text-gray-400'
            }`}>
              <span>{bankData.accountName || "Waiting for details..."}</span>
              {bankData.accountName && bankData.accountName !== "Verification Failed" && (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              )}
              {bankData.accountName === "Verification Failed" && (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving || verifying || !bankData.accountName || bankData.accountName === "Verification Failed"}
            className="w-full bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#a3dcf3] hover:text-black transition-all disabled:opacity-20 mt-4 shadow-xl"
          >
            {saving ? "Encrypting & Saving..." : "Lock Bank Details"}
          </button>
        </form>

        <div className="mt-8 p-6 bg-blue-50/50 rounded-[2rem] flex gap-4 border border-blue-100/50">
          <div className="text-blue-500 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-[9px] text-blue-700 font-black leading-relaxed uppercase tracking-tighter">
            System uses direct settlement rails. Ensure the account name shown above matches your legal ID to avoid payment flags.
          </p>
        </div>
      </main>
    </div>
  );
}