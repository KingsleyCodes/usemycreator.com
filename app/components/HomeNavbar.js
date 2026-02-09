"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Added for SEO crawling
import * as fbq from "@/lib/fpixel";
import { 
  Menu, 
  X, 
  ArrowUpRight, 
  Globe,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Zap
} from "lucide-react";

export default function HomeNavbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Solutions", href: "/solutions" },
    { name: "Creator Network", href: "/creator-network" },
    { name: "Enterprise", href: "/enterprise" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
  ];

  // Tracking Helpers - Updated to point to Onboarding
  const trackLoginClick = () => {
    fbq.event('Contact', { content_name: 'Navbar Login Click', location: 'HomeNavbar' });
    router.push("/login");
  };

  const trackRegisterClick = () => {
    fbq.event('Contact', { content_name: 'Navbar Register Click', location: 'HomeNavbar' });
    // DIRECT PATH: Go straight to role selection
    router.push("/onboarding");
  };

  return (
    <>
      {/* --- INSTITUTIONAL HOME NAVBAR --- */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-200 border-b bg-white ${
        isScrolled ? 'shadow-md border-gray-200' : 'border-gray-100'
      }`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Left: Brand Identity - Updated to USE MY CREATOR */}
            <Link 
              href="/"
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="h-9 w-9 bg-black rounded flex items-center justify-center shadow-sm transition-transform group-hover:rotate-6">
                <span className="text-[#a3dcf3] font-black text-lg">U</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900 uppercase hidden xs:block">
                USE MY <span className="text-gray-400">CREATOR</span>
              </span>
            </Link>

            {/* Center: Public Links - Converted to Links for Google Crawling */}
            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 rounded-md text-sm font-semibold text-gray-500 hover:text-black hover:bg-gray-50 transition-all"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right: Authentication Actions */}
            <div className="flex items-center gap-3 sm:gap-6">
              <button 
                onClick={trackLoginClick}
                className="hidden sm:block text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
              >
                Log In
              </button>

              <button 
                onClick={trackRegisterClick}
                className="bg-black text-white px-5 py-2.5 sm:px-7 sm:py-3 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg active:scale-95"
              >
                Get Started <ArrowUpRight className="h-3.5 w-3.5 text-[#a3dcf3]" />
              </button>

              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE DRAWER --- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[110] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          
          <div className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-900 tracking-tight uppercase text-sm">Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-gray-50 rounded-lg"><X className="h-5 w-5"/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 text-gray-900 transition-all border border-transparent font-bold text-lg"
                  >
                    {link.name}
                    <ChevronDown className="h-4 w-4 -rotate-90 text-gray-300" />
                  </Link>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 mt-8">
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <ShieldCheck className="h-5 w-5 text-indigo-600 mb-2" />
                  <p className="text-xs font-bold text-gray-900 uppercase mb-1">Secure Escrow</p>
                  <p className="text-[10px] text-gray-500 font-medium">Enterprise-grade payment protection.</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <Zap className="h-5 w-5 text-[#a3dcf3] mb-2 fill-[#a3dcf3]" />
                  <p className="text-xs font-bold text-gray-900 uppercase mb-1">Verified Talent</p>
                  <p className="text-[10px] text-gray-500 font-medium">Top 3% of Nigerian content creators.</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 space-y-3">
              <button 
                onClick={() => {
                  trackRegisterClick(); // This now points to onboarding
                  setMobileMenuOpen(false);
                }}
                className="w-full py-4 bg-black text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl"
              >
                Join Now
              </button>
              <button 
                onClick={() => {
                  trackLoginClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-4 bg-white text-gray-500 border border-gray-200 rounded-xl font-bold text-sm uppercase tracking-widest"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}