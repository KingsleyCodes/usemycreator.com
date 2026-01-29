"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import BusinessNavbar from "@/app/components/BusinessNavbar";
import { 
  Plus, 
  Search, 
  Twitter, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  Loader2,
  Briefcase
} from "lucide-react";

export default function BusinessCampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);

  // 1. AUTH & DATA FETCHING
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
      if (authenticatedUser) {
        setUser(authenticatedUser);
        await fetchCampaigns(authenticatedUser.uid);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchCampaigns = async (uid) => {
    setLoading(true);
    try {
      // Fetching live campaigns for this specific business
      const q = query(
        collection(db, "campaigns"),
        where("businessId", "==", uid),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCampaigns(fetched);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case 'inactive': return "bg-gray-100 text-gray-600 border-gray-200";
      default: return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#001E00] font-sans antialiased">
      
      {/* INTEGRATED BUSINESS NAVBAR */}
      <BusinessNavbar />

      {/* SUB-HEADER WITH SEARCH */}
      <div className="bg-white border-b border-gray-200 py-8 px-4 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-serif font-medium text-gray-900 tracking-tight">Campaign Manager</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
              Tracking {campaigns.length} active creator briefs
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Find a brief..."
                className="bg-[#F9FAFB] border border-gray-200 pl-11 pr-4 py-3 rounded-full text-xs focus:ring-4 focus:ring-[#a3dcf3]/10 focus:border-[#a3dcf3] outline-none w-full md:w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* CREATE CAMPAIGN BUTTON 1 */}
            <button 
              onClick={() => router.push("/dashboard/business/create-campaign")}
              className="bg-black text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 text-[#a3dcf3]" /> New Brief
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#a3dcf3] mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 animate-pulse">Syncing Briefs...</p>
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredCampaigns.map((campaign) => (
              <div 
                key={campaign.id}
                onClick={() => router.push(`/dashboard/business/campaigns/${campaign.id}`)}
                className="group bg-white border border-gray-200 rounded-[2rem] p-6 md:p-8 hover:border-[#a3dcf3] hover:shadow-xl hover:shadow-[#a3dcf3]/5 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-8"
              >
                <div className="flex gap-6 items-start">
                  <div className="h-14 w-14 bg-black rounded-2xl flex items-center justify-center text-[#a3dcf3] shrink-0 transform group-hover:rotate-3 transition-transform">
                    {campaign.platform === "Twitter" ? <Twitter className="h-7 w-7" /> : <CheckCircle2 className="h-7 w-7" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#a3dcf3] transition-colors truncate max-w-[200px] md:max-w-md">
                        {campaign.title}
                      </h3>
                      <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full border ${getStatusStyle(campaign.status)}`}>
                        {campaign.status || 'Draft'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1 mb-4">{campaign.description}</p>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        <Clock className="h-3 w-3" /> 
                        {campaign.createdAt?.seconds 
                          ? new Date(campaign.createdAt.seconds * 1000).toLocaleDateString() 
                          : "Processing..."}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">
                        <ShieldCheck className="h-3 w-3" /> 
                        {campaign.paymentStatus === 'escrow_locked' ? 'Funded' : 'Unfunded'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 pt-6 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Escrow Budget</p>
                    <p className="text-2xl font-serif font-medium text-gray-900">₦{campaign.budget?.toLocaleString()}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-[3rem] py-32 text-center flex flex-col items-center">
            <div className="h-20 w-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
              <Briefcase className="h-8 w-8 text-gray-200" />
            </div>
            <h3 className="text-xl font-serif font-medium text-gray-900 mb-2">No active briefs found</h3>
            <p className="text-sm text-gray-400 max-w-xs mb-8">
              Post a new campaign to start receiving applications from top creators.
            </p>
            {/* CREATE CAMPAIGN BUTTON 2 (EMPTY STATE) */}
            <button 
              onClick={() => router.push("/dashboard/business/create-campaign")}
              className="bg-black text-white px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10"
            >
              Post a Campaign
            </button>
          </div>
        )}
      </main>

      {/* FOOTER DECORATION */}
      <div className="py-20 flex justify-center opacity-20">
        <span className="text-gray-900 font-serif font-black text-2xl italic uppercase tracking-tighter">mycreator.</span>
      </div>
    </div>
  );
}