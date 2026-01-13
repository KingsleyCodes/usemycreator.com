"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Check for Admin first (Fastest path for you)
      const adminDoc = await getDoc(doc(db, "admins", user.uid));
      if (adminDoc.exists()) {
        router.push("/dashboard/admin");
        return;
      }

      // 3. Check for Creator + Ban Status
      const creatorDoc = await getDoc(doc(db, "creators", user.uid));
      if (creatorDoc.exists()) {
        const data = creatorDoc.data();
        if (data.isBanned) {
          await signOut(auth); // ⛔ Kick them out!
          alert("Your account has been suspended for violating platform terms.");
          setLoading(false);
          return;
        }
        router.push("/dashboard/creator");
        return;
      }

      // 4. Check for Business + Ban Status
      const businessDoc = await getDoc(doc(db, "businesses", user.uid));
      if (businessDoc.exists()) {
        const data = businessDoc.data();
        if (data.isBanned) {
          await signOut(auth); // ⛔ Kick them out!
          alert("Access denied. This business account is currently suspended.");
          setLoading(false);
          return;
        }
        router.push("/dashboard/business");
        return;
      }

      // 5. Fallback for your old 'users' collection (if still using it)
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.isBanned) {
          await signOut(auth);
          alert("This account is suspended.");
          setLoading(false);
          return;
        }
        router.push(data.role === "business" ? "/dashboard/business" : "/dashboard/creator");
      } else {
        alert("User data not found. Please sign up.");
        await signOut(auth);
      }

    } catch (error) {
      console.error("Login error:", error);
      // Friendly error messages
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
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc] px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100">
        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">Welcome Back</h1>
        <p className="text-gray-500 mb-8 font-medium">Login to manage your campaigns.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              className="w-full border-2 border-gray-50 bg-gray-50/50 p-4 rounded-2xl focus:border-[#a3dcf3] focus:bg-white outline-none transition-all font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border-2 border-gray-50 bg-gray-50/50 p-4 rounded-2xl focus:border-[#a3dcf3] focus:bg-white outline-none transition-all font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 mt-4 rounded-2xl font-black text-lg shadow-xl hover:bg-gray-800 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 font-medium">
            Don't have an account? <span className="text-black font-bold cursor-pointer hover:underline">Sign Up</span>
          </p>
        </div>
      </div>
    </div>
  );
}