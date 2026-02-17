"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

import { 
  Instagram, 
  Youtube, 
  Twitter, 
  Globe, 
  Sparkles, 
  ShieldCheck,
  ArrowUpRight,
  ExternalLink,
  Video,
  X,
  Send,
  Loader2
} from "lucide-react";

export default function CreatorPublicProfileClient({ slug }) {
  const router = useRouter();
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- REQUEST STATES ---
  const [currentUser, setCurrentUser] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [brief, setBrief] = useState({
    campaignName: "",
    budget: "",
    details: ""
  });

  // Helper to map platform names to Icons
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "Instagram": return <Instagram className="h-5 w-5" />;
      case "YouTube": return <Youtube className="h-5 w-5" />;
      case "Twitter/X": return <Twitter className="h-5 w-5" />;
      case "TikTok": return <Video className="h-5 w-5" />;
      default: return <Globe className="h-5 w-5" />;
    }
  };

  useEffect(() => {
    // Listen for Auth changes
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    const fetchCreator = async () => {
      try {
        const q = query(
          collection(db, "creators"), 
          where("profileSlug", "==", slug), 
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          if (data.isPublic === false) {
             setCreator(null);
          } else {
             setCreator(data);
          }
        }
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchCreator();
    return () => unsubAuth();
  }, [slug]);

  // --- SUBMIT INITIALIZATION ---
  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!currentUser) return router.push("/login");
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, "chats"), {
        businessId: currentUser.uid,
        creatorId: creator.uid,
        creatorName: creator.name,
        creatorImage: creator.profileImage || "",
        campaignName: brief.campaignName,
        budget: brief.budget,
        details: brief.details,
        status: "pending",
        participants: [currentUser.uid, creator.uid],
        lastMessage: `New Proposal: ${brief.campaignName}`,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      alert("Deployment Successful. Proposal sent to Creator.");
      setIsRequesting(false);
      router.push("/dashboard/business");
    } catch (error) {
      console.error("Request Error:", error);
      alert("Initialization failed. Please check connection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-black rounded-xl mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Infrastructure...</p>
      </div>
    </div>
  );

  if (!creator) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white text-center px-4">
      <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Deployment Offline</h1>
      <p className="text-gray-500 mb-8 max-w-xs">This profile is either private or does not exist in our institutional database.</p>
      <button onClick={() => router.push("/")} className="bg-black text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest">Return to Gateway</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 relative overflow-x-hidden">
      
      {/* --- INITIALIZATION SLIDE-OVER --- */}
      {isRequesting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submitting && setIsRequesting(false)} />
          <div className="relative h-full w-full max-w-lg bg-white shadow-2xl p-10 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Initialize <span className="text-[#22c55e]">Brief</span></h2>
              <button onClick={() => setIsRequesting(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-6 flex-1">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Campaign Identity</label>
                <input required placeholder="e.g. Winter 2026 Collection" className="w-full border-2 border-gray-50 bg-gray-50/50 p-4 rounded-2xl focus:border-[#22c55e] focus:bg-white outline-none font-bold text-sm transition-all" onChange={(e) => setBrief({...brief, campaignName: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Allocated Budget ($)</label>
                <input required type="number" placeholder="e.g. 2500" className="w-full border-2 border-gray-50 bg-gray-50/50 p-4 rounded-2xl focus:border-[#22c55e] focus:bg-white outline-none font-bold text-sm transition-all" onChange={(e) => setBrief({...brief, budget: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Deployment Details</label>
                <textarea required rows="6" placeholder="Describe deliverables..." className="w-full border-2 border-gray-50 bg-gray-50/50 p-4 rounded-2xl focus:border-[#22c55e] focus:bg-white outline-none font-medium text-sm transition-all resize-none" onChange={(e) => setBrief({...brief, details: e.target.value})} />
              </div>
              <div className="pt-4">
                <button disabled={submitting} type="submit" className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 hover:bg-gray-800 transition-all disabled:opacity-50">
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Deploy Proposal <Send className="h-4 w-4 text-[#22c55e]" /></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PUBLIC PAGE UI --- */}
      <div className="h-64 bg-black w-full relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 md:left-20 md:translate-x-0">
          <div className="h-40 w-40 rounded-[3rem] bg-white p-2 shadow-2xl">
            <div className="h-full w-full rounded-[2.5rem] bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
              {creator.profileImage ? <img src={creator.profileImage} alt={creator.name} className="h-full w-full object-cover" /> : <span className="text-5xl font-black text-gray-300 uppercase">{creator.name?.[0]}</span>}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-[#22c55e] text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">{creator.specialty || "Institutional Creator"}</span>
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-widest"><ShieldCheck className="h-3.5 w-3.5" /> Verified Deployment</div>
            </div>
            <h1 className="text-6xl font-black text-gray-900 tracking-tighter mb-6 uppercase">{creator.name}</h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mb-12 font-medium">{creator.bio || "No institutional bio provided."}</p>

            <div className="mb-12">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6">Verified Channels</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {creator.platforms?.map((platform) => (
                        <a key={platform} href={creator.socialLinks?.[platform]} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between bg-white border border-gray-100 p-5 rounded-[2rem] shadow-sm hover:border-black hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-[#22c55e] transition-colors">{getPlatformIcon(platform)}</div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Platform</p>
                                    <p className="text-sm font-black text-gray-900">{platform}</p>
                                </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-black transition-colors" />
                        </a>
                    ))}
                </div>
            </div>
          </div>

          <div className="w-full lg:w-[400px]">
            <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-2xl sticky top-10 border-t-4 border-t-black">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#22c55e]" /> Partnership Hub</h3>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              <button onClick={() => currentUser ? setIsRequesting(true) : router.push('/login')} className="w-full bg-black text-white py-6 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] mb-6 hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1">
                Initialize Request <ArrowUpRight className="h-5 w-5 text-[#22c55e]" />
              </button>
              <p className="text-[9px] text-gray-400 font-bold text-center uppercase tracking-[0.2em]">Secure enterprise connection required.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}