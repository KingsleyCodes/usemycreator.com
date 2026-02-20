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
import ProposalModal from "@/app/components/ProposalModal";
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
  ChevronRight,
  FileText,
  CreditCard
} from "lucide-react";

// --- UPDATED RESPONSIVE PROFILE NUDGE (WITH BANK CHECK) ---
const ProfileNudge = ({ userData, router }) => {
  if (!userData) return null;

  const checks = [
    { 
      id: 'bio', 
      label: "Bio", 
      isMet: !!userData?.bio && userData?.bio?.length > 5 
    },
    { 
      id: 'platforms', 
      label: "Socials", 
      isMet: userData?.platforms?.length > 0 && Object.keys(userData?.socialLinks || {}).length > 0 
    },
    { 
      id: 'bank', 
      label: "Bank Info", // This looks for the bankDetails you set up in Settings
      isMet: !!userData?.bankDetails?.accountNumber && !!userData?.bankDetails?.bankName 
    },
    { 
      id: 'rates', 
      label: "Rates", 
      isMet: !!userData?.baseRate && userData?.baseRate > 0 
    },
  ];

  const completed = checks.filter(c => c.isMet).length;
  const percentage = Math.round((completed / checks.length) * 100);

  // Once 100% complete, the nudge disappears to clean up the dashboard
  if (percentage === 100) return null;

  return (
    <div className="mb-6 md:mb-10 bg-white border border-gray-100 rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 hidden sm:block group-hover:opacity-10 transition-opacity">
        <Sparkles className="h-16 md:h-24 w-16 md:w-24 text-[#22c55e]" />
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4 md:gap-8">
        
        {/* Progress & Title Wrapper */}
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative h-14 w-14 md:h-20 md:w-20 flex items-center justify-center shrink-0">
            <svg className="h-full w-full transform -rotate-90">
              <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100 sm:hidden" />
              <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100 hidden sm:block" />
              
              <circle
                cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent"
                strokeDasharray={150.8}
                strokeDashoffset={150.8 - (150.8 * percentage) / 100}
                className="text-[#22c55e] transition-all duration-1000 ease-out sm:hidden"
              />
              <circle
                cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="transparent"
                strokeDasharray={219.9}
                strokeDashoffset={219.9 - (219.9 * percentage) / 100}
                className="text-[#22c55e] transition-all duration-1000 ease-out hidden sm:block"
              />
            </svg>
            <span className="absolute text-sm md:text-lg font-black italic tracking-tighter">{percentage}%</span>
          </div>

          <div className="flex-1 lg:text-left">
            <h2 className="text-lg md:text-xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">
              Setup <span className="text-[#22c55e]">Progress</span>
            </h2>
            <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
              {!userData?.bankDetails?.accountNumber ? "Add bank details to get paid." : "Complete profile to unlock deals."}
            </p>
          </div>
        </div>

        {/* Checklist */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 w-full lg:flex-1 border-y lg:border-none border-gray-100 py-3 lg:py-0">
          {checks.map((check) => (
            <div key={check.id} className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full shrink-0 ${check.isMet ? 'bg-[#22c55e]' : 'bg-gray-200'}`} />
              <span className={`text-[9px] font-black uppercase tracking-tighter truncate ${check.isMet ? 'text-gray-900' : 'text-gray-400'}`}>
                {check.label}
              </span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button 
          onClick={() => {
            // Smart routing: if bank is missing, go to settings. Otherwise go to profile.
            const targetPath = !userData?.bankDetails?.accountNumber 
              ? '/dashboard/creator/settings' 
              : '/dashboard/creator/profile';
            router.push(targetPath);
          }}
          className="w-full lg:w-auto bg-black text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] hover:bg-[#22c55e] hover:text-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
        >
          {percentage > 75 ? "Almost There" : "Finish Setup"} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default function CreatorDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [appliedCampaigns, setAppliedCampaigns] = useState({});
  const [activeChats, setActiveChats] = useState([]);
  const [loading, setLoading] = useState(true);

  // MODAL STATES
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [activeCampaignForSubmission, setActiveCampaignForSubmission] = useState(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedCampaignForProposal, setSelectedCampaignForProposal] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        // REAL-TIME USER DATA LISTENER
        const unsubscribeUser = onSnapshot(doc(db, "creators", user.uid), (doc) => {
          if (doc.exists()) {
            setUserData(doc.data());
          }
        });

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

        const appQuery = query(
          collection(db, "applications"),
          where("creatorId", "==", user.uid)
        );
        
        const unsubscribeApps = onSnapshot(appQuery, (appSnap) => {
            const appliedMap = {};
            appSnap.docs.forEach((doc) => {
              appliedMap[doc.data().campaignId] = doc.data().status;
            });
            setAppliedCampaigns(appliedMap);
        });

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
          unsubscribeUser();
          unsubscribeChats();
          unsubscribeCampaigns();
          unsubscribeApps();
        };

      } catch (err) {
        console.error("Creator dashboard error:", err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

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
      alert("Market rates updated successfully!");
    } catch (err) {
      console.error("Rate update error:", err);
      alert("Failed to save rates.");
    }
  };

  const handleOpenProposal = (campaign) => {
    setSelectedCampaignForProposal(campaign);
    setIsProposalModalOpen(true);
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
        <Loader2 className="h-10 w-10 animate-spin text-[#22c55e] mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loading Studio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#001E00] font-sans antialiased">
      <GlobalNotification targetType="creators" />
      <CreatorNavbar creatorName={userData?.name} balance={userData?.balance || 0} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        
        {/* UPDATED NUDGE: TRACKS BANK & PROFILE INFO */}
        <ProfileNudge userData={userData} router={router} />

        {/* HERO SECTION */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-[#22c55e] rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold text-[#22c55e] uppercase tracking-widest">Active Marketplace</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-serif font-medium leading-tight">
                    Find your next <span className="text-gray-400">partnership.</span>
                </h1>
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div className="h-10 w-10 bg-[#22c55e]/20 rounded-full flex items-center justify-center">
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
                <MessageSquare className="h-4 w-4 text-[#22c55e]" /> Active Channels
            </h3>
            <button onClick={() => router.push('/dashboard/messages')} className="text-[10px] font-bold text-gray-400 uppercase hover:text-black transition-colors">View All Messages</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeChats.length > 0 ? (
              activeChats.map((chat) => (
                <div 
                  key={chat.id} 
                  onClick={() => router.push(`/dashboard/chat/${chat.id}`)}
                  className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#22c55e] transition-all cursor-pointer group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center text-[#22c55e] font-bold text-xs">
                      {chat.businessName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 truncate text-sm">{chat.businessName}</h4>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Direct Message</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-200 group-hover:text-[#22c55e] transition-colors" />
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

        {/* INTEGRATED PRICING TOOL */}
        <div className="mb-12">
          <CreatorPricingSettings 
            initialData={{
              avgViews: userData?.avgViews,
              niche: userData?.niche,
              isVerified: true
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
                                    <div className="bg-[#22c55e]/10 text-[#2299cc] border border-[#22c55e]/20 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Escrow Locked
                                    </div>
                                )}
                                {isAssignedToMe && (
                                    <div className="bg-[#22c55e] text-black border border-[#22c55e] text-[10px] font-black px-3 py-1 rounded-full uppercase italic">
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
                                              className="w-full sm:w-auto bg-black text-[#22c55e] px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#22c55e]/5"
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
                                          status === "accepted" ? "bg-[#22c55e]/10 text-[#2299cc] border-[#22c55e]/20" : 
                                          "bg-red-50 text-red-600 border-red-100"
                                        }`}>
                                          Proposal {status}
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => handleOpenProposal(c)}
                                          disabled={!isFunded || c.status !== "open"}
                                          className={`w-full sm:w-auto px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                            isFunded && c.status === "open"
                                            ? "bg-black text-white hover:bg-gray-800 shadow-lg" 
                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                          }`}
                                        >
                                          Submit Proposal
                                          <FileText className="h-3 w-3" />
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
                          <span className="text-xs font-bold text-[#22c55e] block">100%</span>
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
                  <Sparkles className="h-12 w-12 text-[#22c55e]" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#22c55e] mb-3">Pro Tip</p>
                <p className="text-xs font-medium leading-relaxed text-gray-300 relative z-10">
                  Brands are 4x more likely to accept proposals that mention specific ideas for their campaign platform.
                </p>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL INTEGRATIONS */}
      {selectedCampaignForProposal && (
        <ProposalModal 
          isOpen={isProposalModalOpen}
          onClose={() => {
            setIsProposalModalOpen(false);
            setSelectedCampaignForProposal(null);
          }}
          campaign={selectedCampaignForProposal}
        />
      )}

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