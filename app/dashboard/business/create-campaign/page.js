"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { NICHES } from "@/lib/pricingConfig";
import MarketSentiment from "@/app/components/dashboard/MarketSentiment";
import { 
  X, 
  ChevronRight, 
  ShieldCheck, 
  Loader2, 
  LogOut,
  ChevronLeft,
  Twitter,
  Target
} from "lucide-react";

export default function CreateCampaign() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); 
  const [businessProfile, setBusinessProfile] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    platform: "Instagram",
    niche: "lifestyle", // Added niche to state
    targetViews: 5000,   // Added default target views for sentiment calculation
    budget: "",
    milestones: "upfront", 
    status: "inactive",
    paymentStatus: "unfunded" 
  });

  // 1. PERSISTENCE: Load draft from localStorage on initial mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("campaignDraft");
    if (savedDraft) {
      try {
        setFormData(JSON.parse(savedDraft));
      } catch (err) {
        console.error("Error parsing saved draft:", err);
      }
    }
  }, []);

  // 2. PERSISTENCE: Save to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem("campaignDraft", JSON.stringify(formData));
  }, [formData]);

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

  const nextStep = (e) => {
    e.preventDefault();
    if (step === 1 && (!formData.title || !formData.description)) {
      return alert("Please fill in the title and description.");
    }
    setStep(2);
    window.scrollTo(0, 0); 
  };

  const prevStep = () => {
    setStep(1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return alert("You must be logged in.");
    if (Number(formData.budget) <= 0) return alert("Please set a valid budget.");

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "campaigns"), {
        businessId: auth.currentUser.uid,
        businessName: businessProfile?.companyName || "A Brand",
        businessEmail: auth.currentUser.email,
        title: formData.title.trim(),
        description: formData.description.trim(),
        platform: formData.platform,
        niche: formData.niche,
        targetViews: formData.targetViews,
        budget: Number(formData.budget),
        milestones: formData.milestones,
        status: "inactive", 
        paymentStatus: "unfunded",
        createdAt: serverTimestamp(),
      });

      // Clear the draft after successful submission
      localStorage.removeItem("campaignDraft");

      fetch('/api/broadcast-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignTitle: formData.title.trim(),
          budget: formData.budget,
          platform: formData.platform,
        }),
      }).catch(err => console.error("Broadcast notification failed:", err));
      
      router.push(`/dashboard/business/pay/${docRef.id}`);

    } catch (err) {
      console.error("Campaign creation error:", err);
      alert("Failed to create campaign.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#001E00] font-sans antialiased">
      {/* COMPACT NAV WITH EXIT BUTTON */}
      <nav className="h-14 md:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/dashboard/business")}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-gray-500 hover:text-black"
            aria-label="Exit"
          >
            <X className="h-5 w-5" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Step {step} of 2</span>
        </div>

        <button 
          onClick={handleSignOut}
          className="text-[10px] font-bold text-gray-400 hover:text-red-600 transition-colors uppercase tracking-widest flex items-center gap-2"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </nav>

      {/* PROGRESS BAR */}
      <div className="w-full h-1 bg-gray-100">
        <div 
          className="h-full bg-[#a3dcf3] transition-all duration-500" 
          style={{ width: `${(step / 2) * 100}%` }}
        />
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 md:py-12">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 md:p-10">
            
            {step === 1 ? (
              /* --- PAGE 1: THE BRIEF --- */
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <header className="mb-6">
                  <h1 className="text-xl md:text-2xl font-serif font-medium mb-1">Create your brief</h1>
                  <p className="text-xs text-gray-500">Tell creators exactly what you need.</p>
                </header>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Campaign Title</label>
                    <input
                      required
                      className="w-full border border-gray-200 bg-white p-3 md:p-4 rounded-xl focus:border-[#a3dcf3] focus:ring-4 focus:ring-[#a3dcf3]/10 outline-none transition-all font-semibold text-sm"
                      placeholder="e.g. Unboxing our new Skincare line"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Platform</label>
                        <select 
                            value={formData.platform}
                            onChange={(e) => setFormData({...formData, platform: e.target.value})}
                            className="w-full border border-gray-200 bg-white p-3 rounded-xl font-bold text-xs"
                        >
                            {["Instagram", "TikTok", "YouTube", "Twitter"].map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Campaign Niche</label>
                        <select 
                            value={formData.niche}
                            onChange={(e) => setFormData({...formData, niche: e.target.value})}
                            className="w-full border border-gray-200 bg-white p-3 rounded-xl font-bold text-xs"
                        >
                            {NICHES.map(n => (
                                <option key={n.id} value={n.id}>{n.icon} {n.label}</option>
                            ))}
                        </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Deliverables</label>
                    <textarea
                      required
                      rows="5"
                      className="w-full border border-gray-200 bg-white p-3 md:p-4 rounded-xl focus:border-[#a3dcf3] focus:ring-4 focus:ring-[#a3dcf3]/10 outline-none transition-all resize-none text-sm"
                      placeholder="Requirements, mentions, and key dates..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full bg-black text-white py-4 rounded-full font-bold text-xs uppercase tracking-widest shadow-md hover:bg-gray-800 flex items-center justify-center gap-2"
                  >
                    Next: Set Budget <ChevronRight className="h-3 w-3 text-[#a3dcf3]" />
                  </button>
                </div>
              </div>
            ) : (
              /* --- PAGE 2: THE BUDGET --- */
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-500">
                <header className="mb-6">
                  <h1 className="text-xl md:text-2xl font-serif font-medium mb-1">Budget & Payments</h1>
                  <p className="text-xs text-gray-500">Secure your funds in our escrow system.</p>
                </header>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Budget (₦)</label>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-[#a3dcf3] uppercase">
                            <Target className="h-3 w-3" /> Target: {formData.targetViews.toLocaleString()} Views
                        </div>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-lg">₦</span>
                      <input
                        required
                        type="number"
                        className="w-full border border-gray-200 bg-white pl-10 pr-4 py-4 rounded-xl focus:border-[#a3dcf3] outline-none font-bold text-2xl"
                        placeholder="0"
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      />
                    </div>

                    {/* MARKET SENTIMENT INTEGRATION */}
                    <MarketSentiment 
                        offerAmount={Number(formData.budget)}
                        targetViews={formData.targetViews}
                        niche={formData.niche}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Escrow Terms</label>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, milestones: 'upfront'})}
                        className={`p-4 rounded-xl border transition-all text-left flex justify-between items-center ${formData.milestones === 'upfront' ? 'border-[#a3dcf3] bg-[#a3dcf3]/5 text-black' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                      >
                        <div>
                          <p className="text-xs font-bold uppercase">100% Upfront</p>
                          <p className="text-[10px] text-gray-500">Funds released after final approval.</p>
                        </div>
                        {formData.milestones === 'upfront' && <ShieldCheck className="h-4 w-4 text-black" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, milestones: 'split'})}
                        className={`p-4 rounded-xl border transition-all text-left flex justify-between items-center ${formData.milestones === 'split' ? 'border-[#a3dcf3] bg-[#a3dcf3]/5 text-black' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                      >
                        <div>
                          <p className="text-xs font-bold uppercase">50/50 Split</p>
                          <p className="text-[10px] text-gray-500">Deposit now, balance on completion.</p>
                        </div>
                        {formData.milestones === 'split' && <ShieldCheck className="h-4 w-4 text-black" />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#f0f9ff] p-4 rounded-xl flex gap-3">
                    <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                    <p className="text-[10px] text-blue-800 leading-normal">
                      Funds are held securely. You only pay when you approve the creator's submission.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    onClick={handleSubmit}
                    className="w-full bg-black text-white py-4 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin text-[#a3dcf3]" /> : "Publish Campaign"}
                  </button>
                  <button
                    type="button"
                    onClick={prevStep}
                    className="w-full text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1 hover:text-black transition-all"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Back to Brief
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}