"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, Building2, Loader2, Sparkles } from "lucide-react";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Now a simple navigation function for the public flow
  const handleSelectRole = (role) => {
    setLoading(true);
    // Redirect to register page with the role as a query parameter
    router.push(`/register?role=${role}`);
  };

  // While redirecting, show the loader
  if (loading) {
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