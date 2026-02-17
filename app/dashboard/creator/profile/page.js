"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function CreatorProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    platforms: [],
    socialLinks: {} // Store links like { Instagram: "...", TikTok: "..." }
  });

  const availablePlatforms = ["Instagram", "TikTok", "YouTube", "Twitter/X"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push("/login");

      const docRef = doc(db, "creators", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          name: data.name || "",
          bio: data.bio || "",
          platforms: data.platforms || [],
          socialLinks: data.socialLinks || {}
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const togglePlatform = (platform) => {
    setProfile((prev) => {
      const isSelected = prev.platforms.includes(platform);
      const newPlatforms = isSelected
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform];
      
      // Clean up the link if they deselect the platform
      const newLinks = { ...prev.socialLinks };
      if (isSelected) delete newLinks[platform];

      return { ...prev, platforms: newPlatforms, socialLinks: newLinks };
    });
  };

  const handleLinkChange = (platform, value) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (profile.platforms.length === 0) return alert("Select at least one platform.");

    setSaving(true);
    try {
      const user = auth.currentUser;
      await updateDoc(doc(db, "creators", user.uid), {
        ...profile,
        updatedAt: new Date()
      });
      alert("Profile updated successfully!");
      router.push("/dashboard/creator");
    } catch (err) {
      console.error(err);
      alert("Error updating profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
       <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-20">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 p-6 flex justify-between items-center sticky top-0 z-50">
        <span className="font-black tracking-tighter text-xl cursor-pointer" onClick={() => router.push("/dashboard/creator")}>
          MYCREATOR<span className="text-[#22c55e]">.</span>IO
        </span>
        <button onClick={() => router.push("/dashboard/creator")} className="text-sm font-bold text-gray-400 hover:text-black transition-colors">
          Exit to Feed
        </button>
      </nav>

      <main className="max-w-2xl mx-auto mt-12 px-4">
        <div className="bg-white shadow-2xl rounded-[2.5rem] p-8 md:p-12 border border-gray-50">
          <header className="mb-10 text-center">
            <h1 className="text-3xl font-black text-gray-900">Creator Identity</h1>
            <p className="text-gray-500 mt-2">Update your profile and social presence.</p>
          </header>

          <form onSubmit={handleSave} className="space-y-8">
            {/* Name & Bio */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
                <input
                  required
                  className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-[#22c55e] outline-none transition-all font-bold"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Bio</label>
                <textarea
                  required
                  rows="3"
                  className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-[#22c55e] outline-none transition-all resize-none font-medium text-gray-600"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
              </div>
            </div>

            {/* Platform Selector */}
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Choose Your Platforms</label>
              <div className="grid grid-cols-2 gap-3">
                {availablePlatforms.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${
                      profile.platforms.includes(p)
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-300 border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Social Links Inputs (Dynamic) */}
            {profile.platforms.length > 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Platform Profile Links</label>
                {profile.platforms.map((p) => (
                  <div key={p} className="flex flex-col">
                    <span className="text-[10px] font-black text-[#22c55e] uppercase mb-1">{p} URL</span>
                    <input
                      required
                      type="url"
                      placeholder={`https://${p.toLowerCase()}.com/yourname`}
                      className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-[#22c55e] outline-none transition-all text-sm"
                      value={profile.socialLinks[p] || ""}
                      onChange={(e) => handleLinkChange(p, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || profile.platforms.length === 0}
              className="w-full bg-[#22c55e] hover:bg-[#8ccce6] text-black py-5 rounded-3xl font-black text-xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Update Profile"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}