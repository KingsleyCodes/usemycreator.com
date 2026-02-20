"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Building2, 
  Search, 
  X, 
  PartyPopper,
  ArrowRight
} from "lucide-react";

export default function BankSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // New success state
  
  const [banks, setBanks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [bankData, setBankData] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    bankCode: ""
  });

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await fetch("/api/verify-bank?type=list");
        const data = await res.json();
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
        setSearchTerm(existingDetails.bankName || "");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const triggerVerification = async () => {
      if (bankData.accountNumber.length === 10 && bankData.bankCode) {
        setVerifying(true);
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

    const timeoutId = setTimeout(triggerVerification, 600);
    return () => clearTimeout(timeoutId);
  }, [bankData.accountNumber, bankData.bankCode]);

  const filteredBanks = banks.filter(bank => 
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const saveSettings = async (e) => {
    e.preventDefault();
    
    if (bankData.accountName === "Verification Failed" || !bankData.accountName) {
      return;
    }

    setSaving(true);
    try {
      const userRef = doc(db, "creators", auth.currentUser.uid);
      await updateDoc(userRef, {
        bankDetails: bankData,
        profileUpdated: true // Helpful for your upcoming "Profile Completion" feature
      });
      
      setIsSuccess(true);
      
      // Auto-redirect after 2.5 seconds
      setTimeout(() => {
        router.push("/dashboard/creator/wallet");
      }, 2500);

    } catch (err) {
      console.error(err);
      alert("Error saving details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center font-black animate-pulse uppercase tracking-[0.3em] text-[10px]">
        Establishing Secure Connection...
      </div>
    </div>
  );

  // SUCCESS VIEW
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="max-w-md w-full text-center">
          <div className="h-24 w-24 bg-[#22c55e] text-black rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-[0_20px_50px_rgba(34,197,94,0.3)] animate-bounce">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic mb-4">
            Payout Locked<span className="text-[#22c55e]">.</span>
          </h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10 leading-relaxed">
            Your bank details have been securely encrypted and saved to your creator profile.
          </p>
          <div className="flex items-center justify-center gap-2 text-[#22c55e] font-black text-[10px] uppercase tracking-widest">
            <Loader2 className="h-4 w-4 animate-spin" />
            Returning to Wallet
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] p-6 font-sans antialiased">
      <nav className="max-w-xl mx-auto mb-12">
        <button onClick={() => router.back()} className="group flex items-center gap-2 text-gray-400 hover:text-black font-black text-[10px] uppercase tracking-widest transition-all">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Wallet
        </button>
      </nav>

      <main className="max-w-xl mx-auto bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100">
        <header className="mb-10 text-center">
          <div className="h-16 w-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">Payout <span className="text-[#22c55e]">Terminal.</span></h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Direct Settlement Verification</p>
        </header>

        <form onSubmit={saveSettings} className="space-y-6">
          {/* SEARCHABLE BANK SELECTION */}
          <div className="relative">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4 mb-2 block">Institution</label>
            <div className="relative">
              <input 
                type="text"
                placeholder="Search Banks..."
                className="w-full p-6 bg-gray-50 border-2 border-transparent rounded-[1.5rem] font-bold outline-none focus:border-black transition-all"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  if (bankData.bankCode) setBankData(prev => ({ ...prev, bankCode: "", bankName: "", accountName: "" }));
                }}
                onFocus={() => setShowDropdown(true)}
              />
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
            </div>

            {showDropdown && searchTerm && filteredBanks.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-[1.5rem] shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden p-2">
                {filteredBanks.map((bank) => (
                  <button
                    key={bank.id}
                    type="button"
                    className="w-full text-left p-4 hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-between"
                    onClick={() => {
                      setBankData({
                        ...bankData,
                        bankCode: bank.code,
                        bankName: bank.name,
                        accountName: "" 
                      });
                      setSearchTerm(bank.name);
                      setShowDropdown(false);
                    }}
                  >
                    <span className="font-bold text-[11px] uppercase tracking-tight">{bank.name}</span>
                    <span className="text-[9px] font-black text-gray-300 tracking-tighter">{bank.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ACCOUNT NUMBER */}
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4 mb-2 block">Account Number</label>
            <div className="relative">
              <input 
                required
                type="text" 
                maxLength="10"
                placeholder="0000000000"
                className="w-full p-6 bg-gray-50 border-2 border-transparent rounded-[1.5rem] font-mono font-bold text-lg outline-none focus:border-black transition-all"
                value={bankData.accountNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ''); 
                  setBankData({...bankData, accountNumber: val});
                }}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                {verifying && <Loader2 className="h-5 w-5 animate-spin text-[#22c55e]" />}
              </div>
            </div>
          </div>

          {/* ACCOUNT NAME */}
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4 mb-2 block">Resolution Result</label>
            <div className={`w-full p-6 rounded-[1.5rem] border-2 font-black text-xs flex items-center justify-between transition-all duration-500 ${
              bankData.accountName && bankData.accountName !== "Verification Failed" 
                ? 'bg-[#22c55e]/5 border-[#22c55e]/20 text-[#22c55e]' 
                : bankData.accountName === "Verification Failed"
                ? 'bg-red-50 border-red-100 text-red-600'
                : 'bg-gray-50 border-transparent text-gray-300'
            }`}>
              <span className="uppercase tracking-widest">{bankData.accountName || "Awaiting Details..."}</span>
              {bankData.accountName && bankData.accountName !== "Verification Failed" && (
                <CheckCircle className="h-5 w-5 text-[#22c55e]" />
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving || verifying || !bankData.accountName || bankData.accountName === "Verification Failed"}
            className="w-full bg-black text-white py-6 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-[#22c55e] hover:text-black transition-all disabled:opacity-20 mt-4 shadow-xl active:scale-95"
          >
            {saving ? "Encrypting..." : "Save Bank Details"}
          </button>
        </form>

        <div className="mt-8 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
          <p className="text-[9px] text-gray-400 font-black leading-relaxed uppercase tracking-widest text-center">
            Secured via Paystack Enterprise Rails. 
            <br/>Payments are settled within 24 hours of release.
          </p>
        </div>
      </main>
    </div>
  );
}