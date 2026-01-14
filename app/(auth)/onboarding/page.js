"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Sparkles, Video, Building2, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSelectRole = async (role) => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      // 1. Get the name we just saved during registration
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userData = userSnap.exists() ? userSnap.data() : {};
      const fullName = userData.name || "New User";

      // 2. Update the base User doc
      await setDoc(doc(db, "users", user.uid), {
        role: role,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // 3. SPAWN SPECIFIC ROLE DOCUMENT
      // This is crucial for Public Profiles to work!
      if (role === "creator") {
        await setDoc(doc(db, "creators", user.uid), {
          uid: user.uid,
          name: fullName,
          email: user.email,
          bio: "",
          specialty: "General Creator",
          isPublic: true, // Defaults to public for the new profiles
          profileSlug: fullName.toLowerCase().replace(/\s+/g, '-'), // Basic slug generation
          socials: { instagram: "", tiktok: "", youtube: "" },
          createdAt: serverTimestamp(),
        });
      } else if (role === "business") {
        await setDoc(doc(db, "businesses", user.uid), {
          uid: user.uid,
          companyName: fullName, // Default to their name until they edit profile
          email: user.email,
          createdAt: serverTimestamp(),
        });
      }

      // 4. Send to Dashboard
      router.push(`/dashboard/${role}`);
      
    } catch (error) {
      console.error("Onboarding Error:", error);
      alert("System failed to initialize profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfcfc] px-4">
      <div className="max-w-xl w-full text-center">
        {/* Branding */}
        <div className="flex justify-center mb-8">
            <div className="h-12 w-12 bg-black rounded-2xl flex items-center justify-center shadow-2xl">
                <Sparkles className="h-6 w-6 text-[#a3dcf3]" />
            </div>
        </div>

        <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tighter uppercase">Define Your Role</h1>
        <p className="text-gray-500 font-medium mb-12">The infrastructure scales differently based on your deployment path.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CREATOR OPTION */}
          <button
            disabled={loading}
            onClick={() => handleSelectRole("creator")}
            className="group relative bg-white border-2 border-gray-100 p-8 rounded-[2.5rem] text-left hover:border-[#a3dcf3] hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
          >
            <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#a3dcf3]/10 transition-colors">
                <Video className="h-7 w-7 text-gray-900 group-hover:text-[#a3dcf3]" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Creator</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">I want to build my public profile, showcase my portfolio, and secure brand deals.</p>
            {loading && <Loader2 className="absolute top-4 right-4 animate-spin text-gray-300" />}
          </button>

          {/* BUSINESS OPTION */}
          <button
            disabled={loading}
            onClick={() => handleSelectRole("business")}
            className="group relative bg-white border-2 border-gray-100 p-8 rounded-[2.5rem] text-left hover:border-black hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
          >
            <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-black transition-colors">
                <Building2 className="h-7 w-7 text-gray-900 group-hover:text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Business</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">I am looking to deploy campaigns and hire elite creators for my brand.</p>
          </button>
        </div>

        <p className="mt-12 text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
          Selection cannot be changed post-initialization.
        </p>
      </div>
    </div>
  );
}