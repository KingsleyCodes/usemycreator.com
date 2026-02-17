"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Redirect if already logged in as admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        if (adminDoc.exists()) {
          router.push("/dashboard/admin");
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Check Admin Collection
      const adminDoc = await getDoc(doc(db, "admins", user.uid));

      if (adminDoc.exists()) {
        router.push("/dashboard/admin");
      } else {
        // Log them out if they aren't an admin
        await signOut(auth);
        setError("Access Denied: You do not have admin privileges.");
      }
    } catch (err) {
      console.error("Login Error:", err.code);
      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Try again later.");
      } else {
        setError("An error occurred during login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white/5 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="text-center">
          <h2 className="text-xs font-black tracking-[0.3em] text-[#22c55e] uppercase mb-2">Secure Terminal</h2>
          <h1 className="text-3xl font-black text-white tracking-tighter">ADMIN ACCESS</h1>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAdminLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">Username</label>
              <input
                type="email"
                required
                placeholder="admin@usemycreator.com"
                className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-[#22c55e] transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">Security Key</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-[#22c55e] transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
              <p className="text-red-500 text-xs font-bold text-center uppercase tracking-widest">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#22c55e] hover:bg-[#8ccce6] text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? "Decrypting..." : "Initialize Session"}
          </button>
        </form>
        
        <p className="text-center text-gray-600 text-[10px] uppercase font-bold tracking-[0.5em]">
          Auth Level 4 Required
        </p>
      </div>
    </div>
  );
}