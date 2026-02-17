"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import BusinessNavbar from "@/app/components/BusinessNavbar";
import { Search, Loader2, ArrowRight } from "lucide-react";

export default function CreatorMarketplace() {
  const router = useRouter();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        fetchAllCreators();
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchAllCreators = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "users"), where("role", "==", "creator"));
      const querySnapshot = await getDocs(q);
      
      const fetchedCreators = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // This log helps you see exactly what fields you have in Firestore
        console.log("Firestore Fields for", doc.id, ":", data);

        return {
          id: doc.id,
          ...data,
          displayTitle: String(data.displayName || data.name || data.fullName || data.username || "Unknown Talent"),
          displayBio: String(data.bio || data.description || "Digital Creator & Storyteller"),
          displayCategory: String(data.category || data.niche || "Content Creator"),
          baseRate: data.baseRate || data.rate || 0
        };
      });

      setCreators(fetchedCreators);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCreators = creators.filter(creator => {
    const term = searchTerm.toLowerCase();
    return (
      creator.displayTitle?.toLowerCase().includes(term) ||
      creator.displayCategory?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#001E00] font-sans antialiased">
      <BusinessNavbar />
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="mb-12 space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-[1px] w-8 bg-[#22c55e]"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#22c55e]">Talent Discovery</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight">
            Find your next <span className="italic">brand face.</span>
          </h1>
        </div>

        <div className="relative max-w-2xl mb-12">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search creators..."
            className="w-full bg-white border border-gray-200 pl-14 pr-6 py-5 rounded-2xl outline-none focus:border-[#22c55e] transition-all text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-12 w-12 animate-spin text-[#22c55e] mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Syncing Talent...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCreators.map((creator) => (
              <div key={creator.id} className="group bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-[#22c55e]/10 transition-all duration-500 flex flex-col h-full relative">
                <div className="flex items-center gap-5 mb-8">
                  <div className="h-16 w-16 rounded-2xl bg-black overflow-hidden border-2 border-white shadow-md">
                    {creator.photoURL ? (
                      <img src={creator.photoURL} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[#22c55e] font-bold text-xl uppercase">
                        {creator.displayTitle.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#22c55e] transition-colors">{creator.displayTitle}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{creator.displayCategory}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-8 flex-1">
                  {creator.displayBio}
                </p>

                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Base Rate</p>
                    <p className="text-lg font-serif font-medium">₦{Number(creator.baseRate).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => router.push(`/dashboard/business/create-campaign?creator=${creator.id}`)}
                    className="bg-black text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2"
                  >
                    Hire <ArrowRight className="h-3 w-3 text-[#22c55e]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}