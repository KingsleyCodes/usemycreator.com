"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut, sendEmailVerification } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import * as fbq from "@/lib/fpixel"; // Import Pixel utility
import { Sparkles, ShieldCheck, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationError, setVerificationError] = useState(false);
  const router = useRouter();

  const handleResendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        alert("A new verification link has been sent to your email.");
      } catch (error) {
        alert("Wait a moment before requesting another link.");
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVerificationError(false);

    // Track login attempt
    fbq.event('Contact', { 
      content_name: 'Login Form Submission',
      method: 'Email' 
    });

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Force refresh the user object to get the latest emailVerified status
      await user.reload();

      // ==========================================================
      // EMAIL VERIFICATION GATE
      // ==========================================================
      if (!user.emailVerified) {
        setVerificationError(true);
        setLoading(false);
        // We do not signOut yet so the user can click 'Resend' 
        return;
      }

      // 1. CHECK FOR ADMIN (Your Owner Account)
      const adminDoc = await getDoc(doc(db, "admins", user.uid));
      if (adminDoc.exists()) {
        router.push("/dashboard/admin");
        return;
      }

      // 2. CHECK FOR CREATOR
      const creatorDoc = await getDoc(doc(db, "creators", user.uid));
      if (creatorDoc.exists()) {
        const data = creatorDoc.data();
        if (data.isBanned) {
          await signOut(auth);
          alert("Your account has been suspended.");
          setLoading(false);
          return;
        }
        
        // Track successful login/return
        fbq.event('CompleteRegistration', { content_name: 'Creator Login Success' });
        router.push("/dashboard/creator");
        return;
      }

      // 3. CHECK FOR BUSINESS
      const businessDoc = await getDoc(doc(db, "businesses", user.uid));
      if (businessDoc.exists()) {
        const data = businessDoc.data();
        if (data.isBanned) {
          await signOut(auth);
          alert("Access denied. This business account is suspended.");
          setLoading(false);
          return;
        }

        // Track successful login/return
        fbq.event('CompleteRegistration', { content_name: 'Business Login Success' });
        router.push("/dashboard/business");
        return;
      }

      // 4. GENERAL FALLBACK (Check the 'users' collection)
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        fbq.event('CompleteRegistration', { content_name: 'User Login Success', role: data.role });
        
        // Dynamic reroute based on role stored during registration
        if (data.role === "business") {
          router.push("/dashboard/business");
        } else if (data.role === "creator") {
          router.push("/dashboard/creator");
        } else {
          // If no role found (shouldn't happen with our new flow), send to public onboarding
          router.push("/onboarding");
        }
      } else {
        alert("User data not found. Please sign up.");
        await signOut(auth);
      }

    } catch (error) {
      console.error("Login error:", error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        alert("Incorrect email or password.");
      } else {
        alert(error.message);
      }
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
        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter uppercase italic">Authorize <span className="text-[#a3dcf3]">Login.</span></h1>
        <p className="text-sm text-gray-500 mb-8 font-medium">Access your institutional management portal.</p>
        
        {/* EMAIL VERIFICATION ALERT BOX */}
        {verificationError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col gap-2 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-widest">
              <AlertCircle className="h-4 w-4" /> Account Not Verified
            </div>
            <p className="text-[11px] text-red-500 font-bold leading-relaxed">
              Your security clearance is pending. Check your inbox for the verification link.
            </p>
            <button 
              onClick={handleResendVerification}
              className="text-left text-[10px] font-black uppercase tracking-tighter text-red-700 underline hover:text-red-900 transition-colors"
            >
              Resend Verification Link?
            </button>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
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
            {loading ? "Authenticating..." : "Authorize Login"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-50 text-center">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            New to the infrastructure?{" "}
            <button 
              onClick={(e) => {
                e.preventDefault();
                fbq.event('Contact', { content_name: 'Login Page Switch to Register' });
                // Now leads back to public onboarding to select intent
                router.push("/onboarding");
              }}
              className="text-black hover:text-[#a3dcf3] transition-colors font-black"
            >
              Sign Up
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