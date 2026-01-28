"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";

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
    
    const user = auth.currentUser;
    if (!user) {
      alert("No active session found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      // 1. Save Creator Profile to Firestore
      const creatorRef = doc(db, "creators", user.uid);
      await setDoc(creatorRef, {
        uid: user.uid,
        name: name.trim(),
        bio: bio.trim(),
        // Production fix: Remove empty strings and extra spaces from skills
        skills: skills.split(",").map((s) => s.trim()).filter(s => s !== ""),
        updatedAt: serverTimestamp(), // Better than Date.now() for DB consistency
        welcomeEmailSent: false, // Initial state
      });

      // 2. Trigger Welcome Email via Resend API
      try {
        await fetch('/api/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: name.trim(),
            type: 'creator', // Tells the API to send the Creator version
            slug: user.uid, // Or your profileSlug if you have one generated
          }),
        });

        // Mark as sent in the DB
        await updateDoc(creatorRef, { welcomeEmailSent: true });
      } catch (emailErr) {
        // We log the error but allow the user to continue to their dashboard
        console.error("Welcome email failed to dispatch:", emailErr);
      }
      
      // 3. Final Redirect
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
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Creator Profile</h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">Set up your brand identity to start applying.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Full Name</label>
            <input
              required
              className="w-full border-2 border-gray-50 bg-gray-50/50 p-4 rounded-2xl focus:border-[#a3dcf3] focus:bg-white outline-none font-bold text-sm transition-all"
              placeholder="e.g. Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Short Bio</label>
            <textarea
              required
              rows="3"
              className="w-full border-2 border-gray-100 bg-gray-50/50 p-4 rounded-2xl focus:border-[#a3dcf3] focus:bg-white outline-none transition-all resize-none font-medium text-sm"
              placeholder="Tell brands why you're a great fit..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Skills</label>
            <input
              className="w-full border-2 border-gray-100 bg-gray-50/50 p-4 rounded-2xl focus:border-[#a3dcf3] focus:bg-white outline-none font-bold text-sm transition-all"
              placeholder="UGC, Fitness, Video Editing (comma separated)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#a3dcf3] text-black hover:bg-[#8bcce6] py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:shadow-2xl transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? "Initializing Profile..." : "Save & View Jobs"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}