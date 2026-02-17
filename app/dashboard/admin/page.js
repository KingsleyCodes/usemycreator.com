"use client";

import { useAdminData } from "./useAdminData";
import { 
  Users, 
  Building2, 
  Briefcase, 
  Banknote, 
  ArrowUpRight, 
  TrendingUp, 
  ShieldAlert, 
  Activity
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardHome() {
  const { creators, businesses, campaigns, payouts, transactions, loading } = useAdminData();

  // --- LIVE ANALYTICS CALCULATIONS ---
  const totalVolume = transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const pendingPayouts = payouts.filter(p => p.status === "pending");
  const pendingLiability = pendingPayouts.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const activeEscrows = campaigns.filter(c => c.paymentStatus === "escrow_locked").length;
  const unverifiedCreators = creators.filter(c => !c.isVerified).length;

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center text-[#108a00] font-black uppercase text-[10px] tracking-widest animate-pulse">
      Syncing Intelligence Feed...
    </div>
  );

  const stats = [
    { 
      label: "Total Platform Volume", 
      value: `₦${totalVolume.toLocaleString()}`, 
      icon: TrendingUp, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      link: "/dashboard/admin/transactions" 
    },
    { 
      label: "Pending Payouts", 
      value: `₦${pendingLiability.toLocaleString()}`, 
      sub: `${pendingPayouts.length} Requests`,
      icon: Banknote, 
      color: "text-red-500", 
      bg: "bg-red-50",
      link: "/dashboard/admin/payouts" 
    },
    { 
      label: "Live Escrows", 
      value: activeEscrows, 
      sub: "Funds Locked",
      icon: Briefcase, 
      color: "text-[#108a00]", 
      bg: "bg-green-50",
      link: "/dashboard/admin/campaigns" 
    },
    { 
      label: "Total Creators", 
      value: creators.length, 
      sub: `${unverifiedCreators} Unverified`,
      icon: Users, 
      color: "text-purple-600", 
      bg: "bg-purple-50",
      link: "/dashboard/admin/creators" 
    },
  ];

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-700">
      
      {/* WELCOME HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-[#001e00]">
          System <span className="text-[#108a00]">Overview.</span>
        </h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
          <Activity className="h-3 w-3 text-[#108a00] animate-pulse" /> Live platform diagnostics
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <Link href={stat.link} key={i} className="group">
            <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/40 hover:border-black transition-all hover:-translate-y-1">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-200 group-hover:text-black transition-colors" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black tracking-tighter text-black">{stat.value}</h3>
              {stat.sub && (
                <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tight">{stat.sub}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* RECENT BUSINESS ACTIVITY */}
        <div className="bg-[#001e00] text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <Building2 className="h-5 w-5 text-[#22c55e]" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">Latest Businesses</h2>
            </div>
            
            <div className="space-y-6">
              {businesses.slice(0, 4).map((biz) => (
                <div key={biz.id} className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="font-black uppercase italic tracking-tight">{biz.companyName}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{biz.email}</p>
                  </div>
                  <Link href="/dashboard/admin/businesses" className="text-[9px] font-black uppercase text-[#22c55e] hover:underline">Verify</Link>
                </div>
              ))}
            </div>
          </div>
          {/* Decorative background flair */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* ALERTS & NOTICES */}
        <div className="bg-white border border-gray-100 p-8 rounded-[3rem] shadow-xl">
           <div className="flex items-center gap-3 mb-8">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Critical Alerts</h2>
           </div>

           <div className="space-y-4">
              {pendingPayouts.length > 0 && (
                <div className="bg-red-50 border border-red-100 p-6 rounded-[2rem] flex items-center justify-between">
                  <div>
                    <p className="text-red-600 font-black text-xs uppercase">Payouts Pending</p>
                    <p className="text-[10px] text-red-400 font-bold">Requires manual bank transfer</p>
                  </div>
                  <Link href="/dashboard/admin/payouts" className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Process</Link>
                </div>
              )}

              {unverifiedCreators > 0 && (
                <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 font-black text-xs uppercase italic">Verification Queue</p>
                    <p className="text-[10px] text-amber-400 font-bold">{unverifiedCreators} creators awaiting badges</p>
                  </div>
                  <Link href="/dashboard/admin/creators" className="bg-amber-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Review</Link>
                </div>
              )}

              {pendingPayouts.length === 0 && unverifiedCreators === 0 && (
                <div className="py-10 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 italic">All Systems Operational</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}