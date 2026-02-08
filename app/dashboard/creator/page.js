"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  orderBy
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

import GlobalNotification from "@/app/components/GlobalNotification";
import CreatorNavbar from "@/app/components/CreatorNavbar";
import CreatorPricingSettings from "@/app/components/dashboard/CreatorPricingSettings";

import SubmissionModal from "@/app/components/SubmissionModal";
import { 
  Sparkles, 
  Briefcase, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Send,
  Twitter,
  Instagram,
  Youtube,
  Video,
  ChevronRight
} from "lucide-react";

export default function CreatorDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [appliedCampaigns, setAppliedCampaigns] = useState({});
  const [activeChats, setActiveChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);

  // MODAL STATES
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [activeCampaignForSubmission, setActiveCampaignForSubmission] = useState(null);

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

        // 2. Fetch AVAILABLE & ASSIGNED campaigns
        const campaignQuery = query(
          collection(db, "campaigns"),
          where("status", "in", ["live", "open", "assigned", "in_review", "completed"]) 
        );
        
        const unsubscribeCampaigns = onSnapshot(campaignQuery, (snapshot) => {
          const campaignList = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          setCampaigns(campaignList);
        });

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

        // 4. REAL-TIME CHAT LISTENER (Sorted by Recency)
        const chatQuery = query(
          collection(db, "chats"),
          where("participants", "array-contains", user.uid),
          orderBy("updatedAt", "desc")
        );

        const unsubscribeChats = onSnapshot(chatQuery, (snapshot) => {
          setActiveChats(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        setLoading(false);
        return () => {
          unsubscribeChats();
          unsubscribeCampaigns();
        };

      } catch (err) {
        console.error("Creator dashboard error:", err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // NEW: HANDLE RATE UPDATES
  const handleRateSave = async (data) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const creatorRef = doc(db, "creators", user.uid);
      await updateDoc(creatorRef, {
        avgViews: data.avgViews,
        niche: data.niche,
        baseRate: data.baseRate,
        pricingLastUpdated: serverTimestamp()
      });
      
      // Update local state to reflect changes immediately
      setUserData(prev => ({
        ...prev,
        avgViews: data.avgViews,
        niche: data.niche,
        baseRate: data.baseRate
      }));

      alert("Market rates updated successfully!");
    } catch (err) {
      console.error("Rate update error:", err);
      alert("Failed to save rates.");
    }
  };

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

      const businessDoc = await getDoc(doc(db, "businesses", targetCampaign.businessId));
      
      if (businessDoc.exists()) {
        const businessData = businessDoc.data();
        
        fetch('/api/notify-application', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessEmail: businessData.email || businessData.contactEmail,
            businessName: businessData.companyName || businessData.name,
            creatorName: userData?.name || "A verified creator",
            campaignTitle: targetCampaign.title
          }),
        }).catch(err => console.error("Notification trigger failed:", err));
      }
      
      setAppliedCampaigns((prev) => ({
        ...prev,
        [campaignId]: "pending",
      }));

      alert("Application sent successfully. The brand has been notified!");
    } catch (err) {
      console.error("Apply error:", err);
      alert("Failed to submit proposal.");
    } finally {
      setApplyingId(null);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'Instagram': return <Instagram className="h-3 w-3" />;
      case 'TikTok': return <Video className="h-3 w-3" />;
      case 'YouTube': return <Youtube className="h-3 w-3" />;
      case 'Twitter': return <Twitter className="h-3 w-3" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-[#a3dcf3] mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loading Studio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#001E00] font-sans antialiased">
      <GlobalNotification targetType="creators" />
      <CreatorNavbar creatorName={userData?.name} balance={userData?.balance || 0} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* HERO SECTION */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active Marketplace</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-serif font-medium leading-tight">
                    Find your next <span className="text-gray-400">partnership.</span>
                </h1>
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div className="h-10 w-10 bg-[#a3dcf3]/20 rounded-full flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-black" />
                </div>
                <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status</p>
                    <p className="text-sm font-bold">Verified Creator</p>
                </div>
            </div>
          </div>
        </div>

        {/* MESSAGING QUICK-ACCESS */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#a3dcf3]" /> Active Channels
            </h3>
            <button onClick={() => router.push('/dashboard/messages')} className="text-[10px] font-bold text-gray-400 uppercase hover:text-black transition-colors">View All Messages</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeChats.length > 0 ? (
              activeChats.map((chat) => (
                <div 
                  key={chat.id} 
                  onClick={() => router.push(`/dashboard/chat/${chat.id}`)}
                  className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#a3dcf3] transition-all cursor-pointer group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center text-[#a3dcf3] font-bold text-xs">
                      {chat.businessName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 truncate text-sm">{chat.businessName}</h4>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Direct Message</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-200 group-hover:text-[#a3dcf3] transition-colors" />
                  </div>
                  <div className="bg-[#F9FAFB] p-3 rounded-xl border border-gray-100">
                      <p className="text-[11px] text-gray-600 line-clamp-1 italic">"{chat.lastMessage || "Start the conversation..."}"</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No active secure channels found</p>
              </div>
            )}
          </div>
        </div>

        {/* PHASE 2: INTEGRATED PRICING TOOL */}
        <div className="mb-12">
          <CreatorPricingSettings 
            initialData={{
              avgViews: userData?.avgViews,
              niche: userData?.niche,
              isVerified: true // Assuming verified based on your UI badge above
            }}
            onSave={handleRateSave} 
          />
        </div>

        {/* OPPORTUNITIES GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" /> New Opportunities
                </h3>
                <span className="text-[10px] font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-500">{campaigns.length} Briefs</span>
            </div>

            {campaigns.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-20 text-center shadow-sm">
                <Loader2 className="h-6 w-6 animate-spin text-gray-200 mx-auto mb-4" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Searching for new briefs...</p>
              </div>
            ) : (
              campaigns.map((c) => {
                const status = appliedCampaigns[c.id];
                const isFunded = c.paymentStatus === "escrow_locked";
                const isAssignedToMe = c.assignedCreatorId === auth.currentUser?.uid;

                return (
                  <div key={c.id} className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
                                    {getPlatformIcon(c.platform)}
                                    {c.platform}
                                </div>
                                {isFunded && (
                                    <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Escrow Locked
                                    </div>
                                )}
                                {isAssignedToMe && (
                                    <div className="bg-[#a3dcf3]/20 text-black border border-[#a3dcf3]/30 text-[10px] font-black px-3 py-1 rounded-full uppercase italic">
                                        Your Project
                                    </div>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">Budget</p>
                                <p className="text-xl font-bold text-gray-900">₦{c.budget?.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-xl md:text-2xl font-serif font-medium text-gray-900 mb-3 group-hover:text-black transition-colors">{c.title}</h2>
                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 md:line-clamp-2">{c.description}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-50 gap-4">
                            <div className="flex items-center gap-4 text-gray-400">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight">
                                    <Clock className="h-3.5 w-3.5" /> 
                                    {c.status === "in_review" ? "Under Review" : c.status === "completed" ? "Settled" : "Open for Proposals"}
                                </div>
                            </div>
                            
                            <div className="w-full sm:w-auto">
                              {isAssignedToMe ? (
                                  <>
                                      {c.status === "assigned" ? (
                                          <button
                                              onClick={() => {
                                                  setActiveCampaignForSubmission(c);
                                                  setIsSubmitModalOpen(true);
                                              }}
                                              className="w-full sm:w-auto bg-black text-[#a3dcf3] px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#a3dcf3]/5"
                                          >
                                              Submit Proof <Send className="h-3 w-3" />
                                          </button>
                                      ) : (
                                          <div className="text-[10px] font-bold uppercase bg-gray-50 text-gray-400 px-8 py-3.5 rounded-full border border-gray-100 text-center">
                                              {c.status === "in_review" ? "Awaiting Payout" : "Paid & Completed"}
                                          </div>
                                      )}
                                  </>
                              ) : (
                                  <>
                                      {status ? (
                                        <div className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                          status === "pending" ? "bg-amber-50 text-amber-600 border-amber-100" : 
                                          status === "accepted" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                          "bg-red-50 text-red-600 border-red-100"
                                        }`}>
                                          Proposal {status}
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => applyToCampaign(c.id)}
                                          disabled={applyingId === c.id || !isFunded || c.status !== "open"}
                                          className={`w-full sm:w-auto px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                            isFunded && c.status === "open"
                                            ? "bg-black text-white hover:bg-gray-800 shadow-lg" 
                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                          }`}
                                        >
                                          {applyingId === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Submit Proposal"}
                                          <ArrowRight className="h-3 w-3" />
                                        </button>
                                      )}
                                  </>
                              )}
                            </div>
                        </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* SIDEBAR STATS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">Performance Insights</h4>
                <div className="space-y-5">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500">Response Rate</span>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-600 block">100%</span>
                          <span className="text-[9px] text-gray-400 uppercase font-bold">Excellent</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500">Reliability Rating</span>
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-900 block">4.9/5.0</span>
                          <span className="text-[9px] text-gray-400 uppercase font-bold">Top Tier</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-black text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                  <Sparkles className="h-12 w-12 text-[#a3dcf3]" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a3dcf3] mb-3">Pro Tip</p>
                <p className="text-xs font-medium leading-relaxed text-gray-300 relative z-10">
                  Brands are 4x more likely to accept proposals that mention specific ideas for their campaign platform.
                </p>
            </div>
          </div>
        </div>
      </main>

      {/* SUBMISSION MODAL INTEGRATION */}
      {activeCampaignForSubmission && (
        <SubmissionModal 
            isOpen={isSubmitModalOpen}
            onClose={() => {
                setIsSubmitModalOpen(false);
                setActiveCampaignForSubmission(null);
            }}
            campaign={activeCampaignForSubmission}
        />
      )}
    </div>
  );
}