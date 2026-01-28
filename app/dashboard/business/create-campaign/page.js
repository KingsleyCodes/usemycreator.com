"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";

export default function CreateCampaign() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Track current step
  const [businessProfile, setBusinessProfile] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    platform: "Instagram",
    budget: "",
    milestones: "upfront", 
    status: "inactive",
    paymentStatus: "unfunded" 
  });

  // Fetch Business details on mount to ensure we have the email/name for the campaign doc
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const bizDoc = await getDoc(doc(db, "businesses", user.uid));
        if (bizDoc.exists()) {
          setBusinessProfile(bizDoc.data());
        }
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.title || !formData.description)) {
      return alert("Please fill in the title and description.");
    }
    setStep(2);
  };

  const prevStep = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return alert("You must be logged in.");
    if (!businessProfile) return alert("Business profile not found. Please complete setup.");
    if (Number(formData.budget) <= 0) return alert("Please set a valid budget.");

    setLoading(true);
    try {
      // 1. Save campaign to Firestore
      // NOTE: We now include businessName and businessEmail for notification efficiency
      const docRef = await addDoc(collection(db, "campaigns"), {
        businessId: auth.currentUser.uid,
        businessName: businessProfile.companyName || businessProfile.name || "A Brand",
        businessEmail: auth.currentUser.email || businessProfile.email || businessProfile.contactEmail,
        title: formData.title.trim(),
        description: formData.description.trim(),
        platform: formData.platform,
        budget: Number(formData.budget),
        milestones: formData.milestones,
        status: "inactive", 
        paymentStatus: "unfunded",
        createdAt: serverTimestamp(),
      });

      // 2. Trigger the Broadcast API to notify all creators
      // We send the platform and budget so the email looks professional
      fetch('/api/broadcast-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignTitle: formData.title.trim(),
          budget: formData.budget,
          platform: formData.platform,
        }),
      }).catch(err => console.error("Broadcast notification failed:", err));
      
      // 3. Redirect to the Paystack payment initialization page
      router.push(`/dashboard/business/pay/${docRef.id}`);

    } catch (err) {
      console.error("Campaign creation error:", err);
      alert("Failed to create campaign.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-6 px-4 relative font-sans overflow-hidden">
      
      {/* SIGN OUT */}
      <button 
        onClick={handleSignOut}
        className="absolute top-6 left-6 text-[10px] font-black text-gray-400 hover:text-red-500 transition-colors uppercase tracking-[0.2em] z-50"
      >
        Sign Out
      </button>

      {/* MAIN CONTAINER: Limited height with internal scroll */}
      <div className="max-w-2xl w-full bg-white shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] flex flex-col max-h-[90vh] border border-gray-100 relative">
        
        {/* FIXED EXIT BUTTON */}
        <button 
          onClick={() => router.push("/dashboard/business")}
          className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-black transition-all z-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* HEADER: Fixed at top of card */}
        <header className="p-8 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`h-1 w-8 rounded-full ${step >= 1 ? 'bg-[#a3dcf3]' : 'bg-gray-100'}`} />
            <div className={`h-1 w-8 rounded-full ${step === 2 ? 'bg-[#a3dcf3]' : 'bg-gray-100'}`} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
            {step === 1 ? "The Brief" : "The Budget"}
          </h1>
          <p className="text-gray-400 text-sm font-medium">Step {step} of 2</p>
        </header>

        {/* SCROLLABLE FORM BODY */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {step === 1 ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Campaign Title</label>
                  <input
                    required
                    className="w-full border-2 border-gray-50 bg-gray-50/30 p-4 rounded-2xl focus:border-[#a3dcf3] focus:bg-white outline-none transition-all placeholder:text-gray-300 font-bold"
                    placeholder="e.g. Summer Skincare Review"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Target Platform</label>
                  <select 
                    className="w-full border-2 border-gray-50 bg-gray-50/30 p-4 rounded-2xl focus:border-[#a3dcf3] focus:bg-white outline-none font-bold"
                    value={formData.platform}
                    onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Deliverables & Requirements</label>
                  <textarea
                    required
                    rows="5"
                    className="w-full border-2 border-gray-50 bg-gray-50/30 p-4 rounded-2xl focus:border-[#a3dcf3] focus:bg-white outline-none transition-all resize-none font-medium"
                    placeholder="Be specific: e.g. 1x 60-second Reel..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg shadow-lg hover:scale-[1.01] transition-all"
                >
                  NEXT: BUDGETING →
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Total Budget (₦)</label>
                  <input
                    required
                    type="number"
                    className="w-full border-2 border-gray-50 bg-gray-50/30 p-4 rounded-2xl focus:border-[#a3dcf3] focus:bg-white outline-none transition-all font-bold text-2xl"
                    placeholder="0"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Escrow Strategy</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, milestones: 'upfront'})}
                      className={`p-4 rounded-xl border-2 transition-all text-xs font-black ${formData.milestones === 'upfront' ? 'border-[#a3dcf3] bg-[#a3dcf3]/5 text-black' : 'border-gray-50 text-gray-300'}`}
                    >
                      100% UPFRONT
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, milestones: 'split'})}
                      className={`p-4 rounded-xl border-2 transition-all text-xs font-black ${formData.milestones === 'split' ? 'border-[#a3dcf3] bg-[#a3dcf3]/5 text-black' : 'border-gray-50 text-gray-300'}`}
                    >
                      50/50 SPLIT
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-1">Escrow Protection</p>
                  <p className="text-xs text-blue-800 font-medium leading-relaxed">
                    Your ₦{Number(formData.budget).toLocaleString()} will be held safely and only released when you approve the content.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 bg-gray-100 text-gray-600 py-5 rounded-2xl font-black text-sm uppercase tracking-widest"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-black text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50"
                  >
                    {loading ? "INITIALIZING..." : "LAUNCH →"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}