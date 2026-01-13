"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { 
  Home,
  Briefcase,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  User
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function CreatorNavbar({ creatorName, balance = 0, pendingEarnings = 0 }) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const navItems = [
    { label: "Studio", icon: Home, path: "/dashboard/creator" },
    { label: "Explore", icon: Search, path: "/dashboard/creator/campaigns" },
    { label: "My Jobs", icon: Briefcase, path: "/dashboard/creator/jobs" },
    { label: "Earnings", icon: Wallet, path: "/dashboard/creator/wallet" },
  ];

  return (
    <>
      {/* --- INSTITUTIONAL STICKY NAVBAR --- */}
      <nav className={`fixed top-0 left-0 right-0 z-[70] transition-all duration-200 border-b bg-white ${
        isScrolled ? 'shadow-md border-gray-200' : 'border-gray-100'
      }`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Left: Brand Identity */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => router.push("/dashboard/creator")}
            >
              <div className="h-9 w-9 bg-black rounded flex items-center justify-center shadow-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900 uppercase hidden xs:block">
                MYCREATOR<span className="text-gray-400">.STUDIO</span>
              </span>
            </div>

            {/* Center: Main Nav */}
            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.path)}
                  className="px-4 py-2 rounded-md text-sm font-semibold text-gray-500 hover:text-black hover:bg-gray-50 transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Creator Earnings Summary (Desktop) */}
              <div className="hidden md:flex items-center gap-4 pr-4 border-r border-gray-200">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending</p>
                  <p className="text-xs font-bold text-gray-900">₦{pendingEarnings.toLocaleString()}</p>
                </div>
                <div 
                  onClick={() => router.push('/dashboard/creator/wallet')}
                  className="bg-black border border-black rounded-lg px-3 py-1.5 flex items-center gap-3 cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">Balance</p>
                    <p className="text-sm font-bold text-white">₦{balance.toLocaleString()}</p>
                  </div>
                  <ArrowUpRight className="h-3 w-3 text-[#a3dcf3]" />
                </div>
              </div>

              {/* Notification icon */}
              <button className="p-2 text-gray-400 hover:text-black transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-blue-500 rounded-full border-2 border-white"></span>
              </button>

              {/* Profile Dropdown (Desktop) */}
              <div className="hidden md:block relative group">
                <button className="flex items-center gap-2 pl-2 outline-none">
                  <div className="h-8 w-8 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] text-gray-700 font-bold uppercase">
                    {creatorName?.charAt(0) || "C"}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-1">
                  <button onClick={() => router.push('/dashboard/creator/profile')} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded">
                    <User className="h-4 w-4" /> My Profile
                  </button>
                  <button onClick={() => router.push('/dashboard/creator/settings')} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded">
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </div>

              {/* HAMBURGER MENU (Right Aligned) */}
              <button 
                ref={hamburgerRef}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 ml-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 hover:bg-black hover:text-white transition-all"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to push content down */}
      <div className="h-16 sm:h-20"></div>

      {/* --- MOBILE DRAWER OVERLAY --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileMenuOpen(false)}></div>
          
          <div className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-900 tracking-tight uppercase text-sm">Creator Studio</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-50 rounded-lg"><X className="h-5 w-5"/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Mobile Wallet Card */}
              <div className="bg-black rounded-2xl p-6 text-white shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Available to Withdraw</p>
                    <h3 className="text-2xl font-bold">₦{balance.toLocaleString()}</h3>
                  </div>
                  <Sparkles className="h-5 w-5 text-[#a3dcf3]" />
                </div>
                <button 
                  onClick={() => { router.push('/dashboard/creator/wallet'); setIsMobileMenuOpen(false); }}
                  className="w-full py-3 bg-[#a3dcf3] text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
                >
                  Withdraw Funds
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-4 tracking-tighter">Navigation</p>
                {navItems.map((item) => (
                  <button 
                    key={item.label}
                    onClick={() => { router.push(item.path); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 text-gray-900 transition-all border border-transparent active:border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className="h-5 w-5 text-gray-400" />
                      <span className="font-bold text-lg">{item.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                  {creatorName?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{creatorName}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Verified Creator</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full py-4 bg-red-50 text-red-600 rounded-xl font-bold text-sm flex items-center justify-center gap-3"
              >
                <LogOut className="h-5 w-5" /> Secure Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Minimal helper icon
function ChevronRight(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  );
}