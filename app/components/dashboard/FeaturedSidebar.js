"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, limit, getDocs, orderBy } from "firebase/firestore";
import { Sparkles, Star, ChevronRight, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FeaturedSidebar() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNiche, setActiveNiche] = useState("All");
  const router = useRouter();

  const niches = ["All", "Lifestyle", "Tech", "Fashion", "Beauty", "Fitness"];

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        let q;
        if (activeNiche === "All") {
          q = query(
            collection(db, "creators"),
            where("isPriority", "==", true),
            limit(5)
          );
        } else {
          q = query(
            collection(db, "creators"),
            where("isPriority", "==", true),
            where("niche", "==", activeNiche),
            limit(5)
          );
        }
        
        const snap = await getDocs(q);
        setCreators(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) { 
        console.error("Error fetching featured creators:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchFeatured();
  }, [activeNiche]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="bg-[#22c55e]/10 p-1.5 rounded-lg">
            <Sparkles className="h-3.5 w-3.5 text-[#22c55e]" />
          </div>
          <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-[0.2em]">Featured Talent</h3>
        </div>
        <button 
          onClick={() => router.push('/dashboard/business/creators')} 
          className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#22c55e] transition-colors"
        >
          View All
        </button>
      </div>

      {/* Niche Filter Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {niches.map((niche) => (
          <button
            key={niche}
            onClick={() => setActiveNiche(niche)}
            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${
              activeNiche === niche
                ? "bg-[#22c55e] text-white border-[#22c55e] shadow-md shadow-[#22c55e]/20"
                : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"
            }`}
          >
            {niche}
          </button>
        ))}
      </div>

      {/* Talent List / Carousel */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto pb-4 lg:pb-0 no-scrollbar snap-x">
        {loading ? (
          // Simple Skeleton Loader
          [1, 2, 3].map((i) => (
            <div key={i} className="min-w-[220px] lg:min-w-full h-16 bg-gray-50 rounded-2xl animate-pulse" />
          ))
        ) : creators.length > 0 ? (
          creators.map((creator) => (
            <div 
              key={creator.id}
              onClick={() => router.push(`/dashboard/business/creators/${creator.id}`)}
              className="min-w-[220px] lg:min-w-full snap-center bg-white border border-gray-100 p-3 rounded-2xl hover:border-[#22c55e] transition-all cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-50 border border-gray-100 overflow-hidden">
                    <img 
                      src={creator.profileImage || `https://ui-avatars.com/api/?name=${creator.displayName}&background=f3f4f6&color=9ca3af`} 
                      className="h-full w-full object-cover" 
                      alt="" 
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-[#22c55e] rounded-full p-0.5 border-2 border-white">
                    <Star className="h-2 w-2 text-white fill-current" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-gray-900 truncate group-hover:text-[#22c55e] transition-colors">
                    {creator.displayName}
                  </h4>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter truncate">
                      {creator.niche || 'Creator'}
                    </span>
                    <span className="text-[8px] text-gray-300">•</span>
                    <span className="text-[9px] text-[#22c55e] font-black uppercase tracking-tighter">
                      {creator.followers || 'Top'}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 group-hover:bg-[#22c55e]/10 p-1.5 rounded-lg transition-colors">
                  <ChevronRight className="h-3 w-3 text-gray-300 group-hover:text-[#22c55e] transition-all" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">No featured {activeNiche} talent</p>
          </div>
        )}
      </div>
    </div>
  );
}