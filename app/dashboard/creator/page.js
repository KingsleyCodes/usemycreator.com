"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

import GlobalNotification from "@/app/components/GlobalNotification";
import CreatorNavbar from "@/app/components/CreatorNavbar";
import { Sparkles, Briefcase, MessageSquare, CheckCircle2, Clock, ArrowRight, ShieldCheck } from "lucide-react";

export default function CreatorDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [appliedCampaigns, setAppliedCampaigns] = useState({});
  const [activeChats, setActiveChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        // 1. Fetch Creator Profile
        const userDoc = await getDoc(doc(db, "creators", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        // 2. Fetch active campaigns
        const campaignQuery = query(
          collection(db, "campaigns"),
          where("status", "==", "active")
        );
        const campaignSnap = await getDocs(campaignQuery);
        const campaignList = campaignSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setCampaigns(campaignList);

        // 3. Fetch creator's applications
        const appQuery = query(
          collection(db, "applications"),
          where("creatorId", "==", user.uid)
        );
        const appSnap = await getDocs(appQuery);
        const appliedMap = {};
        appSnap.docs.forEach((doc) => {
          appliedMap[doc.data().campaignId] = doc.data().status;
        });
        setAppliedCampaigns(appliedMap);

        // 4. REAL-TIME CHAT LISTENER (Inbox)
        const chatQuery = query(
          collection(db, "chats"),
          where("participants", "array-contains", user.uid),
          orderBy("updatedAt", "desc")
        );

        const unsubscribeChats = onSnapshot(chatQuery, (snapshot) => {
          setActiveChats(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        setLoading(false);
        return () => unsubscribeChats();

      } catch (err) {
        console.error("Creator dashboard error:", err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const applyToCampaign = async (campaignId) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      setApplyingId(campaignId);
      const targetCampaign = campaigns.find(c => c.id === campaignId);
      
      await addDoc(collection(db, "applications"), {
        campaignId,
        creatorId: user.uid,
        status: "pending",
        appliedAt: serverTimestamp(),
        businessId: targetCampaign.businessId 
      });
      
      setAppliedCampaigns((prev) => ({
        ...prev,
        [campaignId]: "pending",
      }));
    } catch (err) {
      console.error("Apply error:", err);
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="h-10 w-10 bg-black rounded animate-pulse mb-4 flex items-center justify-center">
            <Sparkles className="text-[#a3dcf3] h-6 w-6" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loading Studio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900">
      <GlobalNotification targetType="creators" />
      <CreatorNavbar creatorName={userData?.name} balance={userData?.balance || 0} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* WELCOME SECTION */}
        <div className="mb-12 border-b border-gray-200 pb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Marketplace Live</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                    Find your next <span className="text-gray-400">partnership.</span>
                </h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Verification Status</p>
                    <p className="text-sm font-bold text-emerald-600 flex items-center gap-1 justify-end">
                        Verified Creator <ShieldCheck className="h-4 w-4" />
                    </p>
                </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: GIGS */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-tighter text-gray-900 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" /> Open Opportunities
                </h3>
                <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">{campaigns.length} Active</span>
            </div>

            {campaigns.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-20 text-center">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Searching for new briefs...</p>
              </div>
            ) : (
              campaigns.map((c) => {
                const status = appliedCampaigns[c.id];
                const isFunded = c.paymentStatus === "escrow_locked";

                return (
                  <div key={c.id} className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded uppercase tracking-tighter">
                                    {c.platform}
                                </div>
                                {isFunded && (
                                    <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-3 py-1 rounded flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Budget Secured
                                    </div>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Budget</p>
                                <p className="text-lg font-black text-gray-900">₦{c.budget?.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-black transition-colors">{c.title}</h2>
                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{c.description}</p>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                            <div className="flex items-center gap-4 text-gray-400">
                                <div className="flex items-center gap-1 text-[11px] font-bold uppercase">
                                    <Clock className="h-3.5 w-3.5" /> 2 days left
                                </div>
                            </div>
                            
                            {status ? (
                              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                                status === "pending" ? "bg-amber-50 text-amber-600 border-amber-100" : 
                                status === "accepted" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                "bg-red-50 text-red-600 border-red-100"
                              }`}>
                                {status}
                              </div>
                            ) : (
                              <button
                                onClick={() => applyToCampaign(c.id)}
                                disabled={applyingId === c.id || !isFunded}
                                className={`px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                                  isFunded 
                                  ? "bg-black text-white hover:bg-gray-800" 
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                }`}
                              >
                                {applyingId === c.id ? "Applying..." : "Submit Proposal"}
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            )}
                        </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT: INBOX */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-tighter text-gray-900 flex items-center gap-2 mb-4">
                <MessageSquare className="h-4 w-4 text-gray-400" /> Active Messages
            </h3>

            <div className="space-y-3">
              {activeChats.length > 0 ? (
                activeChats.map((chat) => (
                  <div 
                    key={chat.id} 
                    onClick={() => router.push(`/dashboard/chat/${chat.id}`)}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:border-black transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold text-sm">
                        {chat.businessName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-gray-900 truncate text-sm">{chat.businessName}</h4>
                            <span className="text-[9px] font-bold text-gray-400">2m ago</span>
                        </div>
                        <p className="text-[10px] font-bold text-[#a3dcf3] uppercase tracking-widest">Partnership Chat</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 line-clamp-1 italic">"{chat.lastMessage}"</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-10 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No active chats</p>
                </div>
              )}
            </div>

            {/* QUICK STATS SIDEBAR (Uniformity) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-8">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Your Performance</h4>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500">Response Rate</span>
                        <span className="text-xs font-bold text-emerald-600">100%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500">Completion</span>
                        <span className="text-xs font-bold text-gray-900">4.9/5.0</span>
                    </div>
                </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}