"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function CreatorOnboarding() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;
      
      const snap = await getDoc(doc(db, "creators", user.uid));
      if (snap.exists()) {
        router.push("/dashboard/creator");
      }
    };
    fetchProfile();
  }, [router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

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
        skills: skills.split(",").map((s) => s.trim()).filter(s => s !== ""),
        updatedAt: serverTimestamp(),
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      
      {/* --- TOP LEFT SIGN OUT --- */}
      <button 
        onClick={handleSignOut}
        className="absolute top-6 left-6 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
      >
        Sign Out
      </button>

      <div className="max-w-md w-full bg-white shadow-2xl rounded-[2.5rem] p-8 md:p-10 border border-gray-100 relative">
        
        {/* --- THE EXIT BUTTON --- */}
        <button 
          onClick={() => router.push("/dashboard/creator")}
          className="absolute top-8 right-8 h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-black transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900">Creator Profile</h1>
          <p className="text-gray-500 mt-2">Show brands what you can do.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-black text-gray-700 mb-1 uppercase tracking-wider">Full Name</label>
            <input
              required
              className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-[#a3dcf3] outline-none transition-all"
              placeholder="e.g. Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-1 uppercase tracking-wider">Bio</label>
            <textarea
              required
              rows="3"
              className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-[#a3dcf3] outline-none transition-all resize-none"
              placeholder="Your elevator pitch..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-1 uppercase tracking-wider">Skills</label>
            <input
              className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-[#a3dcf3] outline-none transition-all"
              placeholder="TikTok, Editing, Fitness (comma separated)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div className="pt-2 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#a3dcf3] hover:bg-[#8bcce6] py-5 rounded-2xl font-black text-lg shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? "Saving Profile..." : "Save & View Jobs"}
            </button>

            <button 
              type="button"
              onClick={() => router.push("/dashboard/creator")}
              className="w-full text-center text-gray-400 font-bold hover:text-black transition-colors text-sm"
            >
              Cancel and return to feed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}