"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function CreatorOnboarding() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user already has profile, redirect to dashboard
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      const snap = await getDoc(doc(db, "creators", auth.currentUser.uid));
      if (snap.exists()) router.push("/dashboard/creator");
    };
    fetchProfile();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, "creators", auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        name,
        bio,
        skills: skills.split(",").map((s) => s.trim()),
        createdAt: Date.now(),
      });
      router.push("/dashboard/creator");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Creator Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border p-3 rounded"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="w-full border p-3 rounded"
          placeholder="Short Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <input
          className="w-full border p-3 rounded"
          placeholder="Skills (comma separated)"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#a3dcf3] p-3 rounded font-semibold"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
