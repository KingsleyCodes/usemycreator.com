"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import BusinessNavbar from "@/app/components/BusinessNavbar";
import { 
  TrendingUp, 
  Users, 
  BarChart3, 
  DollarSign, 
  Loader2,
  PieChart,
  Calendar,
  ArrowUpRight
} from "lucide-react";

export default function BusinessAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    activeCampaigns: 0,
    totalCreators: 0,
    avgEngagement: "4.2%"
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        fetchAnalytics(user.uid);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchAnalytics = async (uid) => {
    setLoading(true);
    try {
      const q = query(collection(db, "campaigns"), where("businessId", "==", uid));
      const snap = await getDocs(q);
      
      let spent = 0;
      let active = 0;
      
      snap.docs.forEach(doc => {
        const data = doc.data();
        // Summing up budget of funded campaigns
        if (data.paymentStatus === "escrow_locked") {
            spent += Number(data.budget || 0);
        }
        if (data.status === "active") {
            active++;
        }
      });

      setStats({
        totalSpent: spent,
        activeCampaigns: active,
        totalCreators: snap.size > 0 ? snap.size + 2 : 0, // Simplified logic for demo
        avgEngagement: "4.8%"
      });
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#001E00] font-sans antialiased">
      
      {/* SHARED BUSINESS NAVBAR */}
      <BusinessNavbar />

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-12 bg-[#a3dcf3] rounded-full"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a3dcf3]">Insights Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-medium text-gray-900 tracking-tight">Performance Analytics</h1>
            <p className="text-gray-400 text-xs font-medium mt-2">Monitor your brand growth and creator ROI in real-time.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gray-500 shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-black" /> This Fiscal Year
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-10 w-10 animate-spin text-[#a3dcf3] mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Compiling Report...</p>
          </div>
        ) : (
          <>
            {/* STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { label: "Total Invested", value: `₦${stats.totalSpent.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Active Briefs", value: stats.activeCampaigns, icon: BarChart3, color: "text-[#a3dcf3]", bg: "bg-[#a3dcf3]/10" },
                { label: "Collaborators", value: stats.totalCreators, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Avg. Engagement", value: stats.avgEngagement, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" }
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-[2.5rem] p-7 shadow-sm hover:shadow-xl hover:shadow-[#a3dcf3]/5 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-black transition-colors" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-serif font-medium text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* DATA VISUALIZATION SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* MAIN GROWTH CHART */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-[3rem] p-8 md:p-10 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Reach Projection</h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-black"></div>
                        <span className="text-[9px] font-bold uppercase text-gray-400">Current</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[#a3dcf3]"></div>
                        <span className="text-[9px] font-bold uppercase text-gray-400">Projected</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full bg-[#F9FAFB] rounded-[2rem] border border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden px-6">
                  {/* CSS-only Graph Bars */}
                  <div className="absolute inset-x-0 bottom-0 h-48 flex items-end justify-around px-8 pb-8">
                    {[30, 50, 40, 80, 60, 95, 70, 85].map((h, i) => (
                      <div 
                        key={i} 
                        style={{ height: `${h}%` }} 
                        className="w-4 md:w-8 bg-black rounded-t-md opacity-[0.03] hover:opacity-100 hover:bg-[#a3dcf3] transition-all cursor-help relative group"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {h * 120} Reach
                        </div>
                      </div>
                    ))}
                  </div>
                  <BarChart3 className="h-12 w-12 text-gray-100 relative z-10" />
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mt-4 relative z-10">Data Visualization Active</p>
                </div>
              </div>

              {/* PLATFORM DISTRIBUTION */}
              <div className="bg-white border border-gray-200 rounded-[3rem] p-8 md:p-10 shadow-sm flex flex-col">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-10">Channel Distribution</h3>
                
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="h-52 w-52 rounded-full border-[20px] border-gray-50 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-[20px] border-t-black border-r-[#a3dcf3] border-b-gray-200 border-l-gray-300 rotate-12"></div>
                    <PieChart className="h-7 w-7 text-gray-200" />
                  </div>
                  
                  <div className="mt-12 w-full space-y-4">
                    {[
                      { name: "Instagram", percent: "52%", color: "bg-black" },
                      { name: "TikTok", percent: "28%", color: "bg-[#a3dcf3]" },
                      { name: "Twitter", percent: "20%", color: "bg-gray-200" }
                    ].map((platform, i) => (
                      <div key={i} className="flex items-center justify-between group cursor-default">
                        <div className="flex items-center gap-3">
                          <div className={`h-2.5 w-2.5 rounded-full ${platform.color} group-hover:scale-125 transition-transform`}></div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{platform.name}</span>
                        </div>
                        <span className="text-xs font-black text-gray-900">{platform.percent}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="py-20 flex flex-col items-center border-t border-gray-100 mt-12 bg-white">
        <span className="text-gray-900 font-serif font-black text-2xl italic uppercase tracking-tighter mb-2">mycreator.</span>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.4em]">Analytics Engine v2.0</p>
      </footer>
    </div>
  );
}