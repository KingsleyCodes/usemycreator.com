"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  Building2, 
  Briefcase, 
  ArrowLeftRight, 
  Banknote, 
  Bell, 
  LayoutDashboard,
  LogOut
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const navItems = [
  { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard }, // Added main dash
  { name: "Creators", href: "/dashboard/admin/creators", icon: Users },
  { name: "Businesses", href: "/dashboard/admin/businesses", icon: Building2 },
  { name: "Campaigns", href: "/dashboard/admin/campaigns", icon: Briefcase },
  { name: "Transactions", href: "/dashboard/admin/transactions", icon: ArrowLeftRight },
  { name: "Payouts", href: "/dashboard/admin/payouts", icon: Banknote },
  { name: "Broadcasts", href: "/dashboard/admin/notifications", icon: Bell },
];

export default function AdminNavbar() {
  const pathname = usePathname();

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 left-0">
        <div className="p-8">
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="h-8 w-8 bg-[#108a00] rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <h1 className="text-xl font-bold text-[#001e00] tracking-tight group-hover:text-[#108a00] transition-colors">Admin<span className="font-light">Core</span></h1>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? "bg-[#108a00]/10 text-[#108a00]" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#001e00]"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-[#108a00]" : "text-gray-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => signOut(auth)}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* --- MOBILE TOP HEADER --- */}
      <header className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-[#108a00] rounded-md flex items-center justify-center text-white text-xs font-bold">A</div>
          <span className="font-bold text-sm">AdminCore</span>
        </div>
        <button onClick={() => signOut(auth)} className="text-gray-400"><LogOut className="h-5 w-5" /></button>
      </header>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-3 z-50 flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 min-w-[60px] ${isActive ? "text-[#108a00]" : "text-gray-400"}`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[9px] font-bold uppercase tracking-tighter">{item.name.slice(0, 4)}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}