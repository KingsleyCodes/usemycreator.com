"use client";

import HomeNavbar from "@/app/components/HomeNavbar";
import { Globe } from "lucide-react";
import { AuthProvider } from "@/app/context/AuthContext"; // Import the provider
import FacebookPixel from "@/app/components/FacebookPixel"; // Import the Pixel component

export default function PublicLayout({ children }) {
  return (
    <AuthProvider> {/* Wrap the entire layout with the Auth Provider */}
      <FacebookPixel /> {/* Loads the Facebook Pixel script and tracks PageViews */}
      <div className="flex flex-col min-h-screen bg-white">
        {/* Standardized Institutional Navigation 
            This replaces the old <header> block entirely.
        */}
        <HomeNavbar />

        {/* Main Content Area 
            The padding top (pt-20) ensures content doesn't hide behind 
            the sticky navbar.
        */}
        <main className="flex-1 pt-20">
          {children}
        </main>

        {/* --- PREMIUM INSTITUTIONAL FOOTER --- */}
        <footer className="bg-white border-t border-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                {/* Updated logo block to match brand color */}
                <div className="h-6 w-6 bg-black rounded flex items-center justify-center">
                  <span className="text-[#a3dcf3] font-black text-[10px]">M</span>
                </div>
                <span className="text-sm font-bold tracking-tighter text-gray-900 uppercase">
                  MYCREATOR<span className="text-gray-400">.STUDIO</span>
                </span>
              </div>
              
              <div className="flex items-center gap-8">
                <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Privacy Policy</a>
                <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Terms of Service</a>
                <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Contact</a>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <Globe className="h-3 w-3 text-[#a3dcf3]" />
                <span>© {new Date().getFullYear()} Global Infrastructure</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}