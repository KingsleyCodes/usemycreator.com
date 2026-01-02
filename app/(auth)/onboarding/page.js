"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSelectRole = async (role) => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);

    await updateDoc(doc(db, "users", user.uid), {
      role,
    });

    if (role === "creator") router.push("/creator");
    if (role === "business") router.push("/business");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Welcome to mycreator</h1>
        <p className="text-gray-600 mb-6">
          Tell us who you are to continue
        </p>

        <button
          disabled={loading}
          onClick={() => handleSelectRole("creator")}
          className="w-full mb-4 py-3 rounded-lg font-semibold bg-[#a3dcf3] text-black hover:opacity-90"
        >
          🎥 I’m a Creator
        </button>

        <button
          disabled={loading}
          onClick={() => handleSelectRole("business")}
          className="w-full py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-100"
        >
          🏢 I’m a Business
        </button>
      </div>
    </div>
  );
}
