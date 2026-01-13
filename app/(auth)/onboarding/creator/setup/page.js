"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export default function CreatorOnboarding() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      // Use a small delay or check auth state properly for production
      const user = auth.currentUser;
      if (!user) return;
      
      const snap = await getDoc(doc(db, "creators", user.uid));
      if (snap.exists()) {
        router.push("/dashboard/creator");
      }
    };
    fetchProfile();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !bio) return alert("Please fill in your name and bio.");
    
    setLoading(true);
    try {
      const user = auth.currentUser;
      await setDoc(doc(db, "creators", user.uid), {
        uid: user.uid,
        name: name.trim(),
        bio: bio.trim(),
        // Production fix: Remove empty strings and extra spaces from skills
        skills: skills.split(",").map((s) => s.trim()).filter(s => s !== ""),
        updatedAt: serverTimestamp(), // Better than Date.now() for DB consistency
      });
      
      router.push("/dashboard/creator");
    } catch (err) {
      console.error("Profile Save Error:", err);
      alert("Failed to save profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900">Creator Profile</h1>
          <p className="text-gray-500 mt-2">Set up your brand identity to start applying.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
            <input
              required
              className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-[#a3dcf3] outline-none transition-all"
              placeholder="e.g. Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Short Bio</label>
            <textarea
              required
              rows="3"
              className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-[#a3dcf3] outline-none transition-all resize-none"
              placeholder="Tell brands why you're a great fit..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Skills</label>
            <input
              className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-[#a3dcf3] outline-none transition-all"
              placeholder="UGC, Fitness, Video Editing (comma separated)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#a3dcf3] hover:bg-[#8bcce6] py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-95 disabled:opacity-50"
          >
            {loading ? "Saving Profile..." : "Save & View Jobs"}
          </button>
        </form>
      </div>
    </div>
  );
}