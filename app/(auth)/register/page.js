"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // 1. Add a try block to catch errors (like 'email already in use')
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Initialize the user document in Firestore
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        email: email,
        role: null, // This ensures they MUST go through onboarding
        createdAt: new Date().toISOString(), // Readable date format
      });

      // 3. Move them to the choice screen
      router.push("/onboarding");
      
    } catch (error) {
      // 4. If something goes wrong, alert the user instead of crashing
      console.error("Registration error:", error.message);
      alert(error.message); 
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Create account</h1>

      <form onSubmit={handleRegister} className="space-y-4">
        <input
          className="w-full border p-3 rounded"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full border p-3 rounded"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-primary p-3 rounded font-semibold">
          Register
        </button>
      </form>
    </div>
  );
}
