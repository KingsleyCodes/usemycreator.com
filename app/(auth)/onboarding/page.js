"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSelectRole = async (role) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Session expired. Please log in again.");
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      // We update the user document to set their chosen role
      await setDoc(doc(db, "users", user.uid), {
        role: role,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // Send them to their specific dashboard
      router.push(`/dashboard/${role}`);
      
    } catch (error) {
      console.error("Error saving role:", error);
      alert("Failed to save selection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">One last step!</h1>
        <p className="text-gray-600 mb-8">
          Are you looking to promote your brand, or are you a creator looking for deals?
        </p>

        <div className="space-y-4">
          <button
            disabled={loading}
            onClick={() => handleSelectRole("creator")}
            className="w-full py-4 rounded-xl font-bold bg-[#a3dcf3] text-black hover:bg-[#8bcce6] transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "🎥 I’m a Creator"}
          </button>

          <button
            disabled={loading}
            onClick={() => handleSelectRole("business")}
            className="w-full py-4 rounded-xl font-bold border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "🏢 I’m a Business"}
          </button>
        </div>
      </div>
    </div>
  );
}