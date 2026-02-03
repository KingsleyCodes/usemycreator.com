"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import * as fbq from "@/lib/fpixel"; // Import Pixel utility
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Initialize search params to capture the ?plan= note from the URL
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan"); // e.g., "pro" or "free"

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Track the registration attempt as a Lead
    fbq.event('Lead', {
      content_name: 'Registration Form Submission',
      content_category: 'User Onboarding',
      value: selectedPlan === 'pro' ? 50000 : 0,
      currency: 'NGN',
      predicted_plan: selectedPlan || 'undecided'
    });
    
    try {
      // 1. Create the Auth Account
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Determine Role and Plan
      // If they came from the pricing page with a plan, they are definitely a business.
      const initialRole = selectedPlan ? "business" : null;
      const initialPlan = selectedPlan || "free";

      // 3. Initialize the base user document in Firestore
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        name: fullName, 
        email: email,
        role: initialRole, // Automatically set if plan exists
        plan: initialPlan, // Saves the "pro" or "free" label
        createdAt: serverTimestamp(), 
      });

      // Track the final success of the registration
      fbq.event('CompleteRegistration', {
        content_name: 'Account Initialized',
        status: 'Success',
        plan: initialPlan
      });

      // 4. Move them to the next step
      // If we already know they are a business, we could skip the choice screen, 
      // but keeping your /onboarding flow as requested for profile setup.
      router.push("/onboarding");
      
    } catch (error) {
      console.error("Registration error:", error.message);
      alert(error.message); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfcfc] px-4">
      {/* Branding Section */}
      <div 
        className="mb-8 flex items-center gap-2 cursor-pointer group"
        onClick={() => router.push("/")}
      >
        <div className="h-8 w-8 bg-black rounded flex items-center justify-center transition-transform group-hover:scale-110">
          <Sparkles className="h-4 w-4 text-[#a3dcf3]" />
        </div>
        <span className="text-sm font-black tracking-tighter text-gray-900 uppercase">
          MYCREATOR<span className="text-gray-400">.STUDIO</span>
        </span>
      </div>

      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-gray-100">
        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">Initialize Account</h1>
        
        {/* Added a dynamic message if a plan is selected */}
        <p className="text-sm text-gray-500 mb-8 font-medium">
          {selectedPlan 
            ? `You are registering for the ${selectedPlan.toUpperCase()} infrastructure.` 
            : "Join the institutional creator infrastructure."}
        </p>
        
        <form onSubmit={handleRegister} className="space-y-5">
          {/* FULL NAME FIELD */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Legal Identity (Full Name)</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="John Doe"
                className="w-full border-2 border-gray-50 bg-gray-50/50 p-4 pl-12 rounded-2xl focus:border-[#a3dcf3] focus:bg-white outline-none transition-all font-medium text-sm text-black"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* EMAIL FIELD */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Identity (Email)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full border-2 border-gray-50 bg-gray-50/50 p-4 pl-12 rounded-2xl focus:border-[#a3dcf3] focus:bg-white outline-none transition-all font-medium text-sm text-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* PASSWORD FIELD */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Security Token (Password)</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border-2 border-gray-50 bg-gray-50/50 p-4 pl-12 rounded-2xl focus:border-[#a3dcf3] focus:bg-white outline-none transition-all font-medium text-sm text-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 mt-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Initializing..." : "Register Account"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-50 text-center">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Already have an account?{" "}
            <button 
              onClick={() => {
                fbq.event('Contact', { content_name: 'Register Page Switch to Login' });
                router.push("/login");
              }}
              className="text-black hover:text-[#a3dcf3] transition-colors font-black"
            >
              Login
            </button>
          </p>
        </div>
      </div>
      
      <div className="mt-10 flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
           <ShieldCheck className="h-3 w-3" /> Secure Gateway
        </div>
        <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
           SOC2 Compliant
        </div>
      </div>
    </div>
  );
}