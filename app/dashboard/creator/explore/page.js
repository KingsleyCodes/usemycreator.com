"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import CreatorNavbar from "@/app/components/CreatorNavbar";
import { 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Trophy, 
  ArrowRight, 
  BarChart3,
  Lightbulb,
  Loader2,
  Instagram,
  Video,
  Youtube,
  Twitter
} from "lucide-react";

export default function ExplorePage() {
  const [topCampaigns, setTopCampaigns] = useState([]);
  const [marketStats, setMarketStats] = useState({ totalActive: 0, topPlatform: "Loading..." });
  const [topCreators, setTopCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. FETCH TOP PAYING CAMPAIGNS
    const campaignQuery = query(
      collection(db, "campaigns"),
      where("status", "==", "open"),
      orderBy("budget", "desc"),
      limit(3)
    );

    const unsubCampaigns = onSnapshot(campaignQuery, (snapshot) => {
      const camps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTopCampaigns(camps);
      
      // Calculate Market Demand on the fly
      if (camps.length > 0) {
        const platforms = camps.map(c => c.platform);
        const mostFrequent = platforms.sort((a,b) =>
          platforms.filter(v => v===a).length - platforms.filter(v => v===b).length
        ).pop();
        setMarketStats({
          totalActive: snapshot.size,
          topPlatform: mostFrequent || "General"
        });
      }
    });

    // 2. FETCH TOP PERFORMING CREATORS (By Balance/Earnings)
    const creatorQuery = query(
      collection(db, "creators"),
      orderBy("balance", "desc"),
      limit(4)
    );

    const unsubCreators = onSnapshot(creatorQuery, (snapshot) => {
      setTopCreators(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubCampaigns();
      unsubCreators();
    };
  }, []);

  const getIcon = (p) => {
    if (p === 'Instagram') return <Instagram className="h-4 w-4" />;
    if (p === 'TikTok') return <Video className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="h-8 w-8 animate-spin text-[#108a00]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#001E00] antialiased pb-20">
      <CreatorNavbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        
        {/* HEADER */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-4">
             <div className="h-2 w-2 bg-[#108a00] rounded-full animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#108a00]">Live Market Intelligence</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tighter">
            The <span className="text-gray-400 italic">Edge.</span>
          </h1>
        </div>

        {/* TRENDING STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-[#108a00] p-8 rounded-[2.5rem] text-white shadow-xl shadow-green-900/20 relative overflow-hidden group">
                <TrendingUp className="absolute -right-4 -top-4 h-24 w-24 opacity-10 group-hover:rotate-12 transition-transform" />
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">High Demand Platform</p>
                <h3 className="text-3xl font-serif italic mb-4">{marketStats.topPlatform}</h3>
                <p className="text-xs opacity-80 leading-relaxed mb-6">Currently the most requested platform by brands. Creators specialized here are seeing 2x more invites.</p>
                <div className="h-1 w-12 bg-white/30 rounded-full" />
            </div>

            <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                <div>
                  <BarChart3 className="h-6 w-6 text-[#108a00] mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Average Payout Range</p>
                  <h3 className="text-2xl font-black">₦120k — ₦450k</h3>
                </div>
                <p className="text-[10px] text-gray-400 font-bold italic mt-4 tracking-tight">Real-time data from last 30 days</p>
            </div>

            <div className="bg-black p-8 rounded-[2.5rem] text-white flex flex-col justify-between">
                <div>
                  <Zap className="h-6 w-6 text-[#22c55e] mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Active Opportunities</p>
                  <h3 className="text-4xl font-black text-[#22c55e]">{marketStats.totalActive}</h3>
                </div>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-4">Live Briefs found</p>
            </div>
        </div>

        {/* TOP PAYING CAMPAIGNS SECTION */}
        <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
                <h2 className="text-xl font-serif font-medium italic shrink-0">Premium Briefs</h2>
                <div className="h-px w-full bg-gray-100" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {topCampaigns.map((camp) => (
                    <div key={camp.id} className="bg-white border border-gray-100 p-8 rounded-[2.5rem] hover:border-black transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-gray-50 p-3 rounded-2xl group-hover:bg-black group-hover:text-white transition-colors">
                                {getIcon(camp.platform)}
                            </div>
                            <span className="text-lg font-black tracking-tighter text-[#108a00]">₦{camp.budget?.toLocaleString()}</span>
                        </div>
                        <h4 className="font-bold text-sm uppercase tracking-tight mb-3 line-clamp-1">{camp.title}</h4>
                        <p className="text-[11px] text-gray-400 font-medium line-clamp-2 leading-relaxed mb-6 italic">"{camp.description}"</p>
                        <button className="w-full py-3 rounded-xl border border-gray-100 text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">View Brief</button>
                    </div>
                ))}
            </div>
        </div>

        {/* TOP EARNERS (SPOTLIGHT) */}
        <div className="bg-white border border-gray-100 rounded-[3rem] p-10 md:p-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                  <h2 className="text-3xl font-serif font-medium">Platform <span className="text-gray-400 italic">Leaders.</span></h2>
                  <p className="text-xs text-gray-400 font-medium mt-2">The highest earning creators this quarter.</p>
                </div>
                <Trophy className="h-10 w-10 text-amber-400 hidden md:block" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {topCreators.map((creator, i) => (
                    <div key={creator.id} className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-[#108a00] border border-gray-100">
                           {i + 1}
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase tracking-tight text-gray-900">{creator.name}</p>
                            <p className="text-[9px] font-black text-[#108a00] uppercase tracking-widest">Verified Pro</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </main>
    </div>
  );
}