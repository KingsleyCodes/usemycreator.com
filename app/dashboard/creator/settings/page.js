"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2, CheckCircle, AlertCircle, Building2, Search, X } from "lucide-react";

export default function BankSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  
  // Lists & Search
  const [banks, setBanks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Bank States
  const [bankData, setBankData] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    bankCode: ""
  });

  useEffect(() => {
    // 1. Fetch Nigerian Bank List via your internal API with type=list
    const fetchBanks = async () => {
      try {
        const res = await fetch("/api/verify-bank?type=list");
        const data = await res.json();
        // Since the API returns data.data (array), we handle it here
        if (Array.isArray(data)) {
          setBanks(data);
        } else if (data.status && data.data) {
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

      const userDoc = await getDoc(doc(db, "creators", user.uid));
      if (userDoc.exists() && userDoc.data().bankDetails) {
        const existingDetails = userDoc.data().bankDetails;
        setBankData(existingDetails);
        // If we have an existing bank name, set the search term so it's visible
        setSearchTerm(existingDetails.bankName || "");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // AUTO-VERIFICATION TRIGGER
  useEffect(() => {
    const triggerVerification = async () => {
      if (bankData.accountNumber.length === 10 && bankData.bankCode) {
        setVerifying(true);
        // Don't clear if it's already verified and matches (prevents flickering)
        
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
          setBankData(prev => ({ ...prev, accountName: "Verification Failed" }));
        } finally {
          setVerifying(false);
        }
      }
    };

    const timeoutId = setTimeout(triggerVerification, 600); // Debounce
    return () => clearTimeout(timeoutId);
  }, [bankData.accountNumber, bankData.bankCode]);

  // Filter banks based on search
  const filteredBanks = banks.filter(bank => 
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          
          {/* SEARCHABLE BANK SELECTION */}
          <div className="relative">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 mb-2 block">Choose Bank</label>
            <div className="relative">
              <input 
                type="text"
                placeholder="Search Bank Name (e.g. Zenith, GTB)"
                className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-black transition-all"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  // Reset code if they start typing again to force re-selection
                  if (bankData.bankCode) setBankData(prev => ({ ...prev, bankCode: "", bankName: "", accountName: "" }));
                }}
                onFocus={() => setShowDropdown(true)}
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searchTerm && (
                  <button type="button" onClick={() => { setSearchTerm(""); setBankData(prev => ({ ...prev, bankCode: "", bankName: "" })); }}>
                    <X className="h-4 w-4 text-gray-300 hover:text-red-500" />
                  </button>
                )}
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* DROPDOWN */}
            {showDropdown && searchTerm && filteredBanks.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden">
                {filteredBanks.map((bank) => (
                  <button
                    key={bank.id}
                    type="button"
                    className="w-full text-left p-4 hover:bg-[#a3dcf3]/10 transition-colors border-b border-gray-50 last:border-none flex items-center justify-between"
                    onClick={() => {
                      setBankData({
                        ...bankData,
                        bankCode: bank.code,
                        bankName: bank.name,
                        accountName: "" // Reset name to trigger new verification
                      });
                      setSearchTerm(bank.name);
                      setShowDropdown(false);
                    }}
                  >
                    <span className="font-bold text-xs uppercase">{bank.name}</span>
                    <span className="text-[8px] font-black text-gray-300 tracking-tighter">{bank.code}</span>
                  </button>
                ))}
              </div>
            )}
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
                  const val = e.target.value.replace(/\D/g, ''); 
                  setBankData({...bankData, accountNumber: val});
                }}
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                {verifying && <Loader2 className="h-5 w-5 animate-spin text-[#a3dcf3]" />}
              </div>
            </div>
          </div>

          {/* ACCOUNT NAME (VERIFIED RESULT) */}
          <div className="relative">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 mb-2 block">Account Name (Auto-Verified)</label>
            <div className={`w-full p-5 rounded-2xl border-2 font-black text-sm flex items-center justify-between transition-all duration-500 ${
              bankData.accountName && bankData.accountName !== "Verification Failed" 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-900' 
                : bankData.accountName === "Verification Failed"
                ? 'bg-red-50 border-red-100 text-red-900'
                : 'bg-gray-50 border-transparent text-gray-400'
            }`}>
              <span className="uppercase">{bankData.accountName || "Waiting for details..."}</span>
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