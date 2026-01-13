"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 1. Check for Admin
      const adminDoc = await getDoc(doc(db, "admins", user.uid));
      if (adminDoc.exists()) {
        router.push("/dashboard/admin");
        return;
      }

      // 2. Check for Creator
      const creatorDoc = await getDoc(doc(db, "creators", user.uid));
      if (creatorDoc.exists()) {
        const data = creatorDoc.data();
        if (data.isBanned) {
          await signOut(auth);
          alert("Your account has been suspended.");
          setLoading(false);
          return;
        }
        router.push("/dashboard/creator");
        return;
      }

      // 3. Check for Business
      const businessDoc = await getDoc(doc(db, "businesses", user.uid));
      if (businessDoc.exists()) {
        const data = businessDoc.data();
        if (data.isBanned) {
          await signOut(auth);
          alert("Access denied. This business account is suspended.");
          setLoading(false);
          return;
        }
        router.push("/dashboard/business");
        return;
      }

      // 4. General Fallback
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        router.push(data.role === "business" ? "/dashboard/business" : "/dashboard/creator");
      } else {
        alert("User data not found. Please sign up.");
        await signOut(auth);
      }

    } catch (error) {
      console.error("Login error:", error);
      if (error.code === 'auth/invalid-credential') {
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
      {/* Small Branding Logo for institutional feel */}
      <div 
        className="mb-8 flex items-center gap-2 cursor-pointer"
        onClick={() => router.push("/")}
      >
        <div className="h-8 w-8 bg-black rounded flex items-center justify-center">
          <span className="text-[#a3dcf3] font-black text-sm">M</span>
        </div>
        <span className="text-sm font-black tracking-tighter text-gray-900 uppercase">
          MYCREATOR<span className="text-gray-400">.STUDIO</span>
        </span>
      </div>

      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100">
        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">Welcome Back</h1>
        <p className="text-sm text-gray-500 mb-8 font-medium">Access your institutional management portal.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Identity (Email)</label>
            <input
              type="email"
              placeholder="name@company.com"
              className="w-full border-2 border-gray-50 bg-gray-50/50 p-4 rounded-2xl focus:border-[#a3dcf3] focus:bg-white outline-none transition-all font-medium text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Security Token (Password)</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border-2 border-gray-50 bg-gray-50/50 p-4 rounded-2xl focus:border-[#a3dcf3] focus:bg-white outline-none transition-all font-medium text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 mt-6 rounded-2xl font-bold text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Authorize Login"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-50 text-center">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            New to the infrastructure?{" "}
            <button 
              onClick={() => router.push("/register")} // ✅ FIXED ROUTING HERE
              className="text-black hover:text-[#a3dcf3] transition-colors"
            >
              Request Access / Sign Up
            </button>
          </p>
        </div>
      </div>
      
      <p className="mt-10 text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
        Secure Enterprise Gateway • SOC2 
      </p>
    </div>
  );
}