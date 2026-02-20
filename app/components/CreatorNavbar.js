"use client";

import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc, 
  limit 
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
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
  User,
  FileText,
  Clock
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function CreatorNavbar({ creatorName, balance = 0, pendingEarnings = 0 }) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);
  const hamburgerRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Real-time Notifications Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(
          collection(db, "notifications"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(10)
        );

        const unsubscribeNotifs = onSnapshot(q, (snapshot) => {
          const notifData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setNotifications(notifData);
        }, (err) => {
          console.error("Notif listener error:", err);
        });

        return () => unsubscribeNotifs();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const markAsRead = async (notifId) => {
    try {
      await updateDoc(doc(db, "notifications", notifId), { read: true });
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Updated navItems: Removed Earnings, Added Profile
  const navItems = [
    { label: "Studio", icon: Home, path: "/dashboard/creator" },
    { label: "Explore", icon: Search, path: "/dashboard/creator/explore" },
    { label: "Applications", icon: FileText, path: "/dashboard/creator/applications" },
    { label: "My Jobs", icon: Briefcase, path: "/dashboard/creator/jobs" },
    { label: "Profile", icon: User, path: "/dashboard/creator/profile" },
  ];

  return (
    <>
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
              <img 
                src="/usemycreatorlogo.png" 
                alt="Logo" 
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </div>

            {/* Center: Main Nav (Desktop) - Now includes Profile */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.path)}
                  className="px-4 py-2 rounded-md text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-50 transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Creator Earnings Summary (Desktop) - Access point for Wallet */}
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
                  <ArrowUpRight className="h-3 w-3 text-[#22c55e]" />
                </div>
              </div>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`p-2 transition-colors relative rounded-full ${isNotifOpen ? 'bg-gray-100 text-black' : 'text-gray-400 hover:text-black'}`}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2 w-2 bg-[#22c55e] rounded-full border-2 border-white"></span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-200 shadow-2xl rounded-[1.5rem] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Notifications</span>
                      {unreadCount > 0 && <span className="bg-[#22c55e] text-black text-[9px] font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            onClick={() => {
                              markAsRead(notif.id);
                              if (notif.link) router.push(notif.link);
                              setIsNotifOpen(false);
                            }}
                            className={`p-4 border-b border-gray-50 cursor-pointer transition-colors flex gap-4 ${!notif.read ? 'bg-[#22c55e]/5 hover:bg-[#22c55e]/10' : 'hover:bg-gray-50'}`}
                          >
                            <div className={`h-10 w-10 rounded-xl shrink-0 flex items-center justify-center ${!notif.read ? 'bg-[#22c55e] text-black' : 'bg-gray-100 text-gray-400'}`}>
                              <Bell className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs leading-relaxed ${!notif.read ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                                {notif.message}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Clock className="h-3 w-3 text-gray-300" />
                                <span className="text-[9px] font-bold text-gray-400 uppercase">
                                  {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center">
                          <Bell className="h-8 w-8 text-gray-100 mx-auto mb-2" />
                          <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest">All caught up</p>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => { router.push('/dashboard/creator/notifications'); setIsNotifOpen(false); }}
                      className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#22c55e] transition-colors border-t border-gray-100"
                    >
                      View All Activity
                    </button>
                  </div>
                )}
              </div>

              {/* Profile Avatar Dropdown */}
              <div className="hidden md:block relative group">
                <button className="flex items-center gap-2 pl-2 outline-none">
                  <div className="h-8 w-8 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] text-gray-700 font-bold uppercase overflow-hidden">
                    {creatorName?.charAt(0) || "C"}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-1">
                  <button onClick={() => router.push('/dashboard/creator/profile')} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded">
                    <User className="h-4 w-4 text-[#22c55e]" /> My Profile
                  </button>
                  <button onClick={() => router.push('/dashboard/creator/settings')} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded">
                    <Settings className="h-4 w-4 text-[#22c55e]" /> Settings
                  </button>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </div>

              {/* Mobile Menu Toggle */}
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

      {/* Spacer */}
      <div className="h-16 sm:h-20"></div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <img src="/usemycreatorlogo.png" alt="Logo" className="h-6 w-auto" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-50 rounded-lg"><X className="h-5 w-5"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
               {/* Wallet/Withdraw Section remains for easy access in mobile */}
               <div className="bg-black rounded-2xl p-6 text-white shadow-xl">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Available to Withdraw</p>
                     <h3 className="text-2xl font-bold">₦{balance.toLocaleString()}</h3>
                   </div>
                   <Sparkles className="h-5 w-5 text-[#22c55e]" />
                 </div>
                 <button onClick={() => { router.push('/dashboard/creator/wallet'); setIsMobileMenuOpen(false); }} className="w-full py-3 bg-[#22c55e] text-black rounded-xl text-xs font-bold uppercase tracking-widest">Withdraw Funds</button>
               </div>
               
               <div className="space-y-1">
                 {navItems.map((item) => (
                   <button key={item.label} onClick={() => { router.push(item.path); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 text-gray-900 transition-all">
                     <div className="flex items-center gap-4">
                       <item.icon className="h-5 w-5 text-[#22c55e]" />
                       <span className="font-bold text-lg">{item.label}</span>
                     </div>
                   </button>
                 ))}
               </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50">
               <button onClick={handleLogout} className="w-full py-4 bg-red-50 text-red-600 rounded-xl font-bold text-sm flex items-center justify-center gap-3">
                 <LogOut className="h-5 w-5" /> Secure Logout
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}