"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { 
  Search, 
  Bell, 
  Briefcase, 
  Users, 
  MessageSquare, 
  Settings,
  Shield,
  TrendingUp,
  ChevronDown,
  LogOut,
  Building2,
  Menu,
  X,
  DollarSign,
  FileText,
  Home,
  PieChart,
  ChevronRight,
  HelpCircle,
  Download,
  Upload,
  PlusCircle,
  Wallet
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function BusinessNavbar({ companyName, balance = 0, spentSoFar = 0 }) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");
  
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsMobileMenuOpen(false);
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleMenuItemClick = (label, path) => {
    setActiveMenuItem(label);
    if (path) {
      router.push(path);
      setIsMobileMenuOpen(false);
    }
  };

  const mainNavItems = [
    { label: "Dashboard", icon: Home, path: "/dashboard/business" },
    { label: "Campaigns", icon: Briefcase, path: "/dashboard/business/campaigns", badge: "5" },
    { label: "Analytics", icon: PieChart, path: "/dashboard/business/analytics" },
    { label: "Creators", icon: Users, path: "/dashboard/business/creators", badge: "24" },
  ];

  const dropdownItems = [
    { label: "Billing & Wallet", icon: Wallet, path: "/dashboard/business/wallet" },
    { label: "Company Settings", icon: Settings, path: "/dashboard/business/settings" },
    { label: "Reports", icon: FileText, path: "/dashboard/business/reports" },
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
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => router.push("/dashboard/business")}
            >
              <div className="h-9 w-9 bg-black rounded flex items-center justify-center shadow-sm">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900 uppercase hidden xs:block">
                MYCREATOR<span className="text-gray-400">.BIZ</span>
              </span>
            </div>

            {/* Center: Desktop Nav (Mature Style) */}
            <div className="hidden lg:flex items-center gap-2">
              {mainNavItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleMenuItemClick(item.label, item.path)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                    activeMenuItem === item.label 
                    ? 'text-black bg-gray-50' 
                    : 'text-gray-500 hover:text-black hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right: Actions & Hamburger */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Desktop Financial Status */}
              <div className="hidden md:flex items-center gap-4 pr-4 border-r border-gray-200">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Spent</p>
                  <p className="text-xs font-bold text-gray-900">₦{spentSoFar.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1 flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase">Balance</p>
                    <p className="text-xs font-bold text-emerald-700">₦{balance.toLocaleString()}</p>
                  </div>
                  <PlusCircle 
                    className="h-4 w-4 text-emerald-600 cursor-pointer hover:scale-110 transition-transform" 
                    onClick={() => router.push('/dashboard/business/wallet')}
                  />
                </div>
              </div>

              {/* Notification & Search (Desktop) */}
              <div className="hidden sm:flex items-center gap-1">
                <button className="p-2 text-gray-400 hover:text-black transition-colors"><Search className="h-5 w-5" /></button>
                <button className="p-2 text-gray-400 hover:text-black transition-colors relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
              </div>

              {/* Profile Dropdown (Desktop) */}
              <div className="hidden md:block relative group">
                <button className="flex items-center gap-2 pl-2 outline-none">
                  <div className="h-8 w-8 rounded bg-gray-900 flex items-center justify-center text-[10px] text-white font-bold">
                    {companyName?.charAt(0) || "B"}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-1">
                  {dropdownItems.map((item) => (
                    <button key={item.label} onClick={() => router.push(item.path)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded">
                      <item.icon className="h-4 w-4" /> {item.label}
                    </button>
                  ))}
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </div>

              {/* HAMBURGER MENU (Now on the Right) */}
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
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileMenuOpen(false)}></div>
          
          {/* Drawer Panel */}
          <div className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-900 tracking-tight">MENU</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-50 rounded-lg"><X className="h-5 w-5"/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Mobile Wallet Card */}
              <div className="bg-gray-900 rounded-2xl p-6 text-white">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Available Balance</p>
                <h3 className="text-2xl font-bold mb-4">₦{balance.toLocaleString()}</h3>
                <button 
                  onClick={() => handleMenuItemClick("Wallet", "/dashboard/business/wallet")}
                  className="w-full py-3 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" /> Add Funds
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-4">Main Navigation</p>
                {mainNavItems.map((item) => (
                  <button 
                    key={item.label}
                    onClick={() => handleMenuItemClick(item.label, item.path)}
                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 text-gray-900 transition-all border border-transparent active:border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className="h-5 w-5 text-gray-400" />
                      <span className="font-bold text-lg">{item.label}</span>
                    </div>
                    {item.badge && <span className="bg-black text-white text-[10px] px-2 py-1 rounded font-bold">{item.badge}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Logout Footer */}
            <div className="p-6 border-t border-gray-100">
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