"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function BusinessSetup() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, "businesses", user.uid));
      if (snap.exists()) router.push("/dashboard/business");
    };
    checkProfile();
  }, [router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const user = auth.currentUser;
    if (!user) {
      alert("Session expired. Please log in again.");
      return;
    }

    try {
      // 1. Save Business Profile to Firestore
      const businessRef = doc(db, "businesses", user.uid);
      await setDoc(businessRef, {
        uid: user.uid,
        companyName: companyName.trim(),
        description: description.trim(),
        industry: industry.trim(),
        updatedAt: serverTimestamp(),
        welcomeEmailSent: false, // Initial state
      });

      // 2. Trigger Welcome Email via Resend API
      try {
        const response = await fetch('/api/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: companyName.trim(),
            type: 'business', // Tells the API to send the Business version
          }),
        });

        if (response.ok) {
          // Mark as sent so the dashboard backup logic doesn't trigger it again
          await updateDoc(businessRef, { welcomeEmailSent: true });
        }
      } catch (emailErr) {
        // We catch this but don't stop the user from proceeding
        console.error("Welcome email failed but profile was saved:", emailErr);
      }

      // 3. Final Redirect
      router.push("/dashboard/business");
    } catch (err) {
      console.error("Setup Error:", err);
      alert("Failed to save profile. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      
      {/* --- TOP LEFT SIGN OUT --- */}
      <button 
        onClick={handleSignOut}
        className="absolute top-6 left-6 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
      >
        Sign Out
      </button>

      <div className="max-w-md w-full bg-white shadow-2xl rounded-[2.5rem] p-8 border border-gray-100 relative">
        
        {/* --- THE EXIT BUTTON --- */}
        <button 
          onClick={() => router.push("/dashboard/business")}
          className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-black transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter uppercase">Business Profile</h1>
          <p className="text-gray-500 text-sm font-medium">Let creators know who you are and what your brand stands for.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2 px-1">Identity</label>
            <input
              className="w-full border-2 border-gray-50 bg-gray-50/50 p-4 rounded-2xl focus:border-[#22c55e] focus:bg-white outline-none font-bold text-sm transition-all"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2 px-1">Niche</label>
            <input
              className="w-full border-2 border-gray-50 bg-gray-50/50 p-4 rounded-2xl focus:border-[#22c55e] focus:bg-white outline-none font-bold text-sm transition-all"
              placeholder="Industry (e.g. Fashion, Tech)"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2 px-1">Brief Description</label>
            <textarea
              className="w-full border-2 border-gray-50 bg-gray-50/50 p-4 rounded-2xl focus:border-[#22c55e] focus:bg-white outline-none resize-none font-medium text-sm transition-all"
              placeholder="What does your company do?"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="pt-2 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#22c55e] text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:shadow-2xl hover:bg-[#8bcce6] transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? "Initializing Deployment..." : "Complete Setup"}
            </button>
            
            <button 
              type="button"
              onClick={() => router.push("/dashboard/business")}
              className="w-full text-center text-gray-400 font-bold hover:text-black transition-colors text-[10px] uppercase tracking-widest"
            >
              Cancel and return
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}