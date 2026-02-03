"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/app/context/AuthContext"; // Import our new context
import { Video, Building2, Loader2, Sparkles } from "lucide-react";

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth(); // Use global auth state
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // EFFECT: Auto-redirect if role is already assigned (from Pricing Page)
  useEffect(() => {
    const autoInitialize = async () => {
      if (!authLoading && user && user.role) {
        setLoading(true);
        try {
          // If they have a role but haven't been initialized in their specific collection yet
          await handleSelectRole(user.role, true); 
        } catch (error) {
          console.error("Auto-onboarding error:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    autoInitialize();
  }, [user, authLoading]);

  const handleSelectRole = async (role, isAuto = false) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (!isAuto) setLoading(true);

    try {
      // 1. Get current data to preserve the Name from registration
      const userSnap = await getDoc(doc(db, "users", currentUser.uid));
      const userData = userSnap.exists() ? userSnap.data() : {};
      const fullName = userData.name || "New User";
      const plan = userData.plan || "free"; // Default to free if not set

      // 2. Update the main User document
      await setDoc(doc(db, "users", currentUser.uid), {
        role: role,
        plan: plan,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // 3. Initialize specific sub-collections
      if (role === "creator") {
        await setDoc(doc(db, "creators", currentUser.uid), {
          uid: currentUser.uid,
          name: fullName,
          email: currentUser.email,
          bio: "",
          specialty: "General Creator",
          isPublic: true,
          profileSlug: fullName.toLowerCase().replace(/\s+/g, '-'),
          socials: { instagram: "", tiktok: "", youtube: "" },
          createdAt: serverTimestamp(),
        }, { merge: true });
      } else if (role === "business") {
        await setDoc(doc(db, "businesses", currentUser.uid), {
          uid: currentUser.uid,
          companyName: fullName,
          email: currentUser.email,
          currentPlan: plan, // Store their plan here too for easy dashboard access
          createdAt: serverTimestamp(),
        }, { merge: true });
      }

      // 4. Route to the correct dashboard
      router.push(`/dashboard/${role}`);
      
    } catch (error) {
      console.error("Onboarding Error:", error);
      if (!isAuto) alert("System failed to initialize profile. Try again.");
    } finally {
      if (!isAuto) setLoading(false);
    }
  };

  // Show a clean loader while checking for auto-redirects
  if (authLoading || (loading && !auth.currentUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#a3dcf3]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#001E00] font-sans antialiased">
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
        <div className="bg-white border border-gray-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-4 italic">
              Join as a <span className="text-[#a3dcf3]">creator</span> or <span className="text-gray-400 underline">business</span>
            </h1>
            <p className="text-gray-600 mb-10 text-lg">
              To provide the best experience, we need to know how you plan to use the studio.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CREATOR OPTION */}
              <button
                disabled={loading}
                onClick={() => handleSelectRole("creator")}
                className="group relative flex flex-col p-8 border-2 border-gray-100 rounded-3xl hover:border-[#a3dcf3] hover:bg-[#a3dcf3]/5 transition-all text-left disabled:opacity-50"
              >
                <div className="flex justify-between items-start mb-6">
                  <Video className="h-8 w-8 text-gray-900 group-hover:text-[#a3dcf3] transition-colors" />
                  <div className="h-6 w-6 rounded-full border-2 border-gray-200 group-hover:border-[#a3dcf3] group-hover:bg-white flex items-center justify-center transition-all">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#a3dcf3] scale-0 group-hover:scale-100 transition-transform" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">I am a creator</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Apply for campaigns, showcase your portfolio, and earn rewards for your content.
                </p>
              </button>

              {/* BUSINESS OPTION */}
              <button
                disabled={loading}
                onClick={() => handleSelectRole("business")}
                className="group relative flex flex-col p-8 border-2 border-gray-100 rounded-3xl hover:border-black hover:bg-gray-50 transition-all text-left disabled:opacity-50"
              >
                <div className="flex justify-between items-start mb-6">
                  <Building2 className="h-8 w-8 text-gray-900" />
                  <div className="h-6 w-6 rounded-full border-2 border-gray-200 group-hover:border-black group-hover:bg-white flex items-center justify-center transition-all">
                    <div className="h-2.5 w-2.5 rounded-full bg-black scale-0 group-hover:scale-100 transition-transform" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">I am a business</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Hire top talent, manage high-output content cycles, and scale your brand reach.
                </p>
              </button>
            </div>

            <div className="mt-12 flex flex-col items-center">
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
                Secure Professional Infrastructure
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-center gap-8 items-center opacity-60 grayscale">
            <span className="text-[10px] font-bold tracking-widest uppercase">Institutional Access</span>
            <span className="text-[10px] font-bold tracking-widest uppercase">Verified Talent</span>
            <span className="text-[10px] font-bold tracking-widest uppercase">Global Escrow</span>
          </div>
        </div>
      </main>
    </div>
  );
}