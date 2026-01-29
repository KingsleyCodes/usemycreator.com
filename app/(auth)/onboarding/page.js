"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Sparkles, Video, Building2, Loader2, ArrowRight } from "lucide-react";

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
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userData = userSnap.exists() ? userSnap.data() : {};
      const fullName = userData.name || "New User";

      await setDoc(doc(db, "users", user.uid), {
        role: role,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      if (role === "creator") {
        await setDoc(doc(db, "creators", user.uid), {
          uid: user.uid,
          name: fullName,
          email: user.email,
          bio: "",
          specialty: "General Creator",
          isPublic: true,
          profileSlug: fullName.toLowerCase().replace(/\s+/g, '-'),
          socials: { instagram: "", tiktok: "", youtube: "" },
          createdAt: serverTimestamp(),
        });
      } else if (role === "business") {
        await setDoc(doc(db, "businesses", user.uid), {
          uid: user.uid,
          companyName: fullName,
          email: user.email,
          createdAt: serverTimestamp(),
        });
      }

      router.push(`/dashboard/${role}`);
      
    } catch (error) {
      console.error("Onboarding Error:", error);
      alert("System failed to initialize profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#001E00] font-sans antialiased">
      {/* Upwork-style Top Navigation Placeholder */}
      <nav className="h-16 bg-white border-b border-gray-200 flex items-center px-6 md:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
          <div className="h-8 w-8 bg-black rounded flex items-center justify-center">
            <span className="text-[#a3dcf3] font-black text-sm">M</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900 hidden sm:block">
            MYCREATOR.STUDIO
          </span>
        </div>
      </nav>

      <main className="max-w-[1000px] mx-auto px-4 py-12 md:py-20">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-4">
              Join as a creator or business
            </h1>
            <p className="text-gray-600 mb-10 text-lg">
              To provide the best experience, we need to know how you plan to use the studio.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CREATOR OPTION */}
              <button
                disabled={loading}
                onClick={() => handleSelectRole("creator")}
                className="group relative flex flex-col p-6 border-2 border-gray-100 rounded-xl hover:border-[#a3dcf3] hover:bg-[#a3dcf3]/5 transition-all text-left disabled:opacity-50"
              >
                <div className="flex justify-between items-start mb-6">
                  <Video className="h-8 w-8 text-gray-900 group-hover:text-black" />
                  <div className="h-6 w-6 rounded-full border-2 border-gray-200 group-hover:border-[#a3dcf3] group-hover:bg-white flex items-center justify-center transition-all">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#a3dcf3] scale-0 group-hover:scale-100 transition-transform" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">I am a creator, looking for work</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Create a professional profile, bid on campaigns, and get paid securely.
                </p>
                {loading && <Loader2 className="absolute top-4 right-4 animate-spin text-gray-300" />}
              </button>

              {/* BUSINESS OPTION */}
              <button
                disabled={loading}
                onClick={() => handleSelectRole("business")}
                className="group relative flex flex-col p-6 border-2 border-gray-100 rounded-xl hover:border-black hover:bg-gray-50 transition-all text-left disabled:opacity-50"
              >
                <div className="flex justify-between items-start mb-6">
                  <Building2 className="h-8 w-8 text-gray-900" />
                  <div className="h-6 w-6 rounded-full border-2 border-gray-200 group-hover:border-black group-hover:bg-white flex items-center justify-center transition-all">
                    <div className="h-2.5 w-2.5 rounded-full bg-black scale-0 group-hover:scale-100 transition-transform" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">I am a business, hiring creators</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Post campaigns, review portfolios, and manage talent and payments in one place.
                </p>
              </button>
            </div>

            <div className="mt-12 flex flex-col items-center">
              <button
                className="w-full md:w-auto px-12 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all disabled:bg-gray-300 shadow-md"
                disabled={loading}
              >
                Create Account
              </button>
              <p className="mt-6 text-sm text-gray-500">
                Already have an account? <span className="text-[#a3dcf3] font-bold cursor-pointer hover:underline" onClick={() => router.push("/login")}>Log In</span>
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-center gap-8 items-center opacity-60 grayscale">
            <span className="text-[10px] font-bold tracking-widest uppercase">Verified Talent</span>
            <span className="text-[10px] font-bold tracking-widest uppercase">Secure Escrow</span>
            <span className="text-[10px] font-bold tracking-widest uppercase">Global Network</span>
          </div>
        </div>
      </main>
    </div>
  );
}