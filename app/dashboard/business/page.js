"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  collection, query, where, getDocs, 
  updateDoc, doc, getDoc, setDoc, serverTimestamp,
  onSnapshot, orderBy, runTransaction, increment, arrayUnion, arrayRemove
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

import GlobalNotification from "@/app/components/GlobalNotification";
import BusinessNavbar from "@/app/components/BusinessNavbar";
import ReviewSubmissionModal from "@/app/components/ReviewSubmissionModal";
import UpgradeTrigger from "@/app/components/dashboard/UpgradeTrigger"; 
import UpgradeSuccess from "@/app/components/dashboard/UpgradeSuccess"; 
import FeaturedSidebar from "@/app/components/dashboard/FeaturedSidebar";

import { 
  Plus, 
  Settings2, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  TrendingUp,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Zap,
  Wallet,
  ArrowUpRight,
  Eye,
  Search,
  ChevronRight,
  Loader2,
  Heart,
  FileText,
  Link2,
  Users,
  UserCheck,
  Briefcase
} from "lucide-react";

export default function BusinessDashboard() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState({});
  const [activeChats, setActiveChats] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [businessProfile, setBusinessProfile] = useState(null);
  
  // NAVIGATION & UI STATE
  const [activeTab, setActiveTab] = useState("campaigns"); // "campaigns" or "shortlist"
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedCampaignForReview, setSelectedCampaignForReview] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState("");

  // PROPOSAL DRAWER STATE
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isProposalDrawerOpen, setIsProposalDrawerOpen] = useState(false);

  // PLAN CHANGE LISTENER STATES
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const lastKnownPlan = useRef(null); 

  // --- HEARTING / FAVORITES SYSTEM ---
  const toggleFavorite = async (creatorId) => {
    if (!auth.currentUser) return;
    const bizRef = doc(db, "businesses", auth.currentUser.uid);
    const isFavorited = businessProfile?.favorites?.includes(creatorId);

    try {
      await updateDoc(bizRef, {
        favorites: isFavorited ? arrayRemove(creatorId) : arrayUnion(creatorId)
      });
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const verifyPaymentOnServer = async (reference, campaignId) => {
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: reference,
          businessId: auth.currentUser.uid,
          campaignId: campaignId
        }),
      });
      const result = await res.json();
      if (result.status === "success") {
        alert("Payment verified and campaign funded successfully!");
      } else {
        alert("Verification failed. Reference: " + reference);
      }
    } catch (err) {
      console.error("Verification Error:", err);
    }
  };

  const fundFromWallet = async (campaign) => {
    const currentBalance = businessProfile?.walletBalance || 0;
    if (currentBalance < campaign.budget) {
      alert(`Insufficient funds. Your balance is ₦${currentBalance.toLocaleString()}.`);
      return;
    }
    if (!confirm(`Use ₦${campaign.budget.toLocaleString()} to fund "${campaign.title}"?`)) return;

    try {
      const bizRef = doc(db, "businesses", auth.currentUser.uid);
      const campaignRef = doc(db, "campaigns", campaign.id);
      const transactionRef = doc(collection(db, "transactions"));

      await runTransaction(db, async (transaction) => {
        const bizDoc = await transaction.get(bizRef);
        if (!bizDoc.exists()) throw "Profile not found";
        const balance = bizDoc.data().walletBalance || 0;
        if (balance < campaign.budget) throw "Insufficient funds";

        transaction.update(bizRef, {
          walletBalance: increment(-campaign.budget),
          updatedAt: serverTimestamp()
        });

        transaction.update(campaignRef, {
          paymentStatus: "escrow_locked",
          status: "open",
          fundedVia: "internal_wallet",
          updatedAt: serverTimestamp()
        });

        transaction.set(transactionRef, {
          businessId: auth.currentUser.uid,
          campaignId: campaign.id,
          amount: campaign.budget,
          type: "escrow_deposit_internal",
          status: "success",
          createdAt: serverTimestamp()
        });
      });
      alert("Campaign Funded Successfully!");
    } catch (err) {
      console.error("Wallet Payment Error:", err);
    }
  };

  const initiateTopUp = async () => {
    const amount = Number(topUpAmount);
    if (amount < 1000) return alert("Minimum top-up is ₦1,000");
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: auth.currentUser.email,
          amount: amount,
          businessId: auth.currentUser.uid,
          metadata: { type: "wallet_topup", businessId: auth.currentUser.uid }
        }),
      });
      const data = await res.json();
      if (data.data?.authorization_url) window.location.href = data.data.authorization_url;
    } catch (err) {
      alert("Could not initiate top-up.");
    }
  };

  const handlePayment = (campaign) => {
    if (!window.PaystackPop) return alert("Infrastructure loading...");
    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: auth.currentUser?.email,
      amount: campaign.budget * 100,
      currency: "NGN",
      callback: (response) => verifyPaymentOnServer(response.reference, campaign.id),
    });
    handler.openIframe();
  };

  const startConversation = async (creatorId, campaignId, creatorName) => {
    const businessId = auth.currentUser.uid;
    const chatId = `${businessId}_${creatorId}_${campaignId}`;
    try {
      const chatRef = doc(db, "chats", chatId);
      await setDoc(chatRef, {
        chatId: chatId,
        participants: [businessId, creatorId],
        businessId, creatorId, campaignId,
        businessName: businessProfile.companyName,
        creatorName,
        lastMessage: "Conversation started",
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      }, { merge: true });
      router.push(`/dashboard/chat/${chatId}`);
    } catch (err) {
      console.error("Chat initiation error:", err);
    }
  };

  const toggleCampaignStatus = async (campaignId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await updateDoc(doc(db, "campaigns", campaignId), { status: newStatus });
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push("/login");
      try {
        const unsubscribeBiz = onSnapshot(doc(db, "businesses", user.uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (lastKnownPlan.current === 'marketplace' && data.plan === 'pro') {
              setShowSuccessScreen(true);
            }
            lastKnownPlan.current = data.plan;
            setBusinessProfile(data);
          }
          setLoading(false);
        });

        const q = query(collection(db, "campaigns"), where("businessId", "==", user.uid));
        const unsubscribeCampaigns = onSnapshot(q, (snap) => {
            setCampaigns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const appQuery = query(collection(db, "applications"), where("businessId", "==", user.uid));
        const unsubscribeApps = onSnapshot(appQuery, async (appSnap) => {
            const appsMap = {};
            for (const a of appSnap.docs) {
                const appData = a.data();
                const creatorSnap = await getDoc(doc(db, "creators", appData.creatorId));
                const creatorData = creatorSnap.exists() ? creatorSnap.data() : { name: "Unknown Creator" };
                if (!appsMap[appData.campaignId]) appsMap[appData.campaignId] = [];
                appsMap[appData.campaignId].push({ id: a.id, ...appData, creatorData });
            }
            setApplications(appsMap);
        });

        const chatQuery = query(collection(db, "chats"), where("participants", "array-contains", user.uid), orderBy("updatedAt", "desc"));
        const unsubscribeChats = onSnapshot(chatQuery, (snapshot) => {
          setActiveChats(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => { 
          unsubscribeBiz(); unsubscribeChats(); unsubscribeCampaigns(); unsubscribeApps(); 
        };
      } catch (err) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleUpdateStatus = async (campaignId, appId, newStatus) => {
    try {
      await updateDoc(doc(db, "applications", appId), { status: newStatus });
      if (newStatus === "accepted") {
        const appSnap = await getDoc(doc(db, "applications", appId));
        if (appSnap.exists()) {
            await updateDoc(doc(db, "campaigns", campaignId), { 
                assignedCreatorId: appSnap.data().creatorId,
                status: "assigned"
            });
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="h-10 w-10 animate-spin text-[#22c55e]" />
      <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Workspace...</p>
    </div>
  );

  if (!businessProfile) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#001E00] antialiased relative">
      <GlobalNotification targetType="businesses" />
      <BusinessNavbar companyName={businessProfile.companyName} balance={businessProfile.walletBalance} />
      <UpgradeTrigger />

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-gray-900">
              {businessProfile.companyName}<span className="text-[#22c55e]">.</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Business Management Hub</p>
          </div>
          <button 
              onClick={() => router.push("/dashboard/business/create-campaign")} 
              className="w-full md:w-auto bg-black text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#22c55e] hover:text-black transition-all shadow-xl shadow-[#22c55e]/10 flex items-center justify-center gap-3"
          >
              <Plus className="h-4 w-4" /> Post New Campaign
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          <div className="lg:col-span-3 space-y-12">
            
            {/* GLOBAL NAVIGATION TABS */}
            <div className="flex items-center gap-8 border-b border-gray-200">
                <button 
                  onClick={() => setActiveTab("campaigns")}
                  className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'campaigns' ? 'border-[#22c55e] text-black' : 'border-transparent text-gray-400'}`}
                >
                  Active Campaigns
                </button>
                <button 
                  onClick={() => setActiveTab("shortlist")}
                  className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'shortlist' ? 'border-[#22c55e] text-black' : 'border-transparent text-gray-400'}`}
                >
                  Shortlisted Talent ({businessProfile.favorites?.length || 0})
                </button>
            </div>

            {activeTab === "campaigns" ? (
              <section className="space-y-8">
                {campaigns.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] p-20 text-center">
                    <Briefcase className="h-10 w-10 text-gray-200 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No campaigns live yet.</p>
                  </div>
                ) : (
                  campaigns.map((c) => (
                    <div key={c.id} className="bg-white border border-gray-200 rounded-[2.5rem] overflow-hidden transition-all hover:shadow-2xl hover:shadow-[#22c55e]/5">
                      <div className="p-8 md:p-12">
                        <div className="flex flex-col md:flex-row justify-between gap-8">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                              <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-100">{c.platform}</span>
                              {c.paymentStatus === "escrow_locked" ? (
                                <span className="text-[#22c55e] text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Funds Escrowed</span>
                              ) : (
                                <span className="text-amber-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><CreditCard className="h-3 w-3" /> Unfunded</span>
                              )}
                            </div>
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">{c.title}</h2>
                            <div className="flex gap-10">
                                <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Budget</p><p className="text-xl font-black italic">₦{c.budget?.toLocaleString()}</p></div>
                                <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Applications</p><p className="text-xl font-black italic">{applications[c.id]?.length || 0}</p></div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 min-w-[200px]">
                            {c.status === "in_review" ? (
                              <button onClick={() => { setSelectedCampaignForReview(c); setIsReviewModalOpen(true); }} className="w-full bg-black text-[#22c55e] py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest">Review & Pay</button>
                            ) : c.paymentStatus !== "escrow_locked" ? (
                              <button onClick={() => fundFromWallet(c)} className="w-full bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#22c55e] hover:text-black transition-all">Fund Escrow</button>
                            ) : (
                              <div className="p-4 bg-gray-50 rounded-2xl text-center border border-gray-100 font-black text-[9px] text-gray-400 uppercase tracking-widest italic">Live & Accepting Pitches</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* UPWORK STYLE APPLICANT LIST */}
                      <div className="bg-[#fcfcfc] border-t border-gray-100 p-8 md:p-12 space-y-4">
                        {applications[c.id]?.length > 0 ? (
                          applications[c.id].map((a) => (
                            <div key={a.id} className="bg-white p-6 rounded-[1.5rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#22c55e] transition-all group">
                              <div className="flex items-center gap-5 w-full md:w-auto">
                                <button onClick={() => toggleFavorite(a.creatorId)} className="focus:outline-none">
                                   <Heart className={`h-5 w-5 transition-all ${businessProfile?.favorites?.includes(a.creatorId) ? "fill-red-500 text-red-500" : "text-gray-300 hover:text-red-400"}`} />
                                </button>
                                <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-gray-400 border border-gray-100 group-hover:bg-[#22c55e] group-hover:text-black transition-all">
                                  {a.creatorData.name[0]}
                                </div>
                                <div>
                                    <h4 className="font-black text-sm uppercase tracking-tighter text-gray-900">{a.creatorData.name}</h4>
                                    <p className="text-[10px] font-black text-[#22c55e] uppercase tracking-widest mt-0.5">Bid: ₦{a.bidAmount?.toLocaleString()}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 w-full md:w-auto">
                                <button 
                                  onClick={() => { setSelectedProposal(a); setIsProposalDrawerOpen(true); }}
                                  className="flex-1 md:flex-none px-8 py-4 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                                >
                                  View Proposal
                                </button>
                                {a.status === "pending" && (
                                  <button onClick={() => handleUpdateStatus(c.id, a.id, "accepted")} className="flex-1 md:flex-none px-8 py-4 bg-[#22c55e] text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#22c55e]/20">Hire</button>
                                )}
                                {a.status === "accepted" && (
                                  <button onClick={() => startConversation(a.creatorId, c.id, a.creatorData.name)} className="px-8 py-4 border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:border-[#22c55e] transition-all">
                                    <MessageSquare className="h-4 w-4" /> Message
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Awaiting Talent Pitches...</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </section>
            ) : (
              /* SHORTLISTED TALENT VIEW */
              <section className="space-y-6">
                 {businessProfile.favorites?.length > 0 ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {businessProfile.favorites.map((favId) => (
                        <div key={favId} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex items-center justify-between gap-6 hover:border-[#22c55e] transition-all group">
                           <div className="flex items-center gap-4">
                              <div className="h-16 w-16 rounded-3xl bg-[#22c55e]/10 flex items-center justify-center font-black text-[#22c55e] text-xl italic border border-[#22c55e]/20">
                                <UserCheck className="h-6 w-6" />
                              </div>
                              <div>
                                <h4 className="font-black uppercase tracking-tighter text-gray-900">Bookmarked Creator</h4>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {favId.slice(0, 8)}</p>
                              </div>
                           </div>
                           <button onClick={() => toggleFavorite(favId)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all">
                              <XCircle className="h-5 w-5" />
                           </button>
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="py-24 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem]">
                      <Heart className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                      <h3 className="text-xl font-black uppercase italic tracking-tighter">Your Talent Bench is Empty</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Heart creators in your campaigns to shortlist them here.</p>
                   </div>
                 )}
              </section>
            )}
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div className="sticky top-24 space-y-8">
              
              <div className="bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Company Wallet</h3>
                    <Wallet className="h-4 w-4 text-[#22c55e]" />
                </div>
                <div className="mb-10">
                  <p className="text-4xl font-black text-gray-900 mb-1 tracking-tighter italic">₦{(businessProfile?.walletBalance || 0).toLocaleString()}</p>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Available Credit</p>
                </div>
                <div className="space-y-4">
                  <input 
                      type="number"
                      placeholder="Amount (₦)"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#22c55e] transition-all"
                  />
                  <button 
                      onClick={initiateTopUp}
                      className="w-full bg-black text-[#22c55e] py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#22c55e]/10"
                  >
                      Add Funds <ArrowUpRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>

              <FeaturedSidebar />
            </div>
          </div>
        </div>
      </main>

      {/* PROPOSAL DRAWER (UPWORK STYLE) */}
      {isProposalDrawerOpen && selectedProposal && (
        <div className="fixed inset-0 z-[150] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsProposalDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 p-8 md:p-12 overflow-y-auto">
            <button 
              onClick={() => setIsProposalDrawerOpen(false)}
              className="mb-12 text-gray-400 hover:text-black flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              <XCircle className="h-5 w-5" /> Close Proposal
            </button>

            <div className="space-y-10">
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 rounded-[2rem] bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center text-3xl font-black text-[#22c55e] italic">
                  {selectedProposal.creatorData.name[0]}
                </div>
                <div>
                  <h3 className="text-3xl font-black italic tracking-tighter uppercase">{selectedProposal.creatorData.name}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidate Pitch</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Proposed Project Fee</p>
                <p className="text-4xl font-black text-gray-900 italic">₦{selectedProposal.bidAmount?.toLocaleString()}</p>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#22c55e]" /> Cover Letter
                </p>
                <div className="text-sm leading-relaxed text-gray-600 font-medium whitespace-pre-wrap bg-gray-50 p-6 rounded-2xl">
                  {selectedProposal.coverLetter}
                </div>
              </div>

              {selectedProposal.portfolioLinks?.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-[#22c55e]" /> Portfolio / Assets
                  </p>
                  <div className="grid gap-2">
                    {selectedProposal.portfolioLinks.map((link, i) => (
                      <a key={i} href={link} target="_blank" rel="noreferrer" className="p-4 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-[#22c55e] uppercase hover:border-[#22c55e] transition-all truncate">
                        View Asset {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-10 border-t border-gray-100 flex flex-col gap-3">
                <button 
                  onClick={() => { handleUpdateStatus(selectedProposal.campaignId, selectedProposal.id, 'accepted'); setIsProposalDrawerOpen(false); }}
                  className="w-full bg-black text-[#22c55e] py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-[#22c55e]/20"
                >
                  Accept & Hire
                </button>
                <button 
                  onClick={() => startConversation(selectedProposal.creatorId, selectedProposal.campaignId, selectedProposal.creatorData.name)}
                  className="w-full border-2 border-gray-100 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:border-black transition-all"
                >
                  <MessageSquare className="h-4 w-4" /> Message First
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCampaignForReview && (
          <ReviewSubmissionModal 
            isOpen={isReviewModalOpen}
            onClose={() => { setIsReviewModalOpen(false); setSelectedCampaignForReview(null); }}
            campaign={selectedCampaignForReview}
          />
      )}

      <UpgradeSuccess isOpen={showSuccessScreen} onClose={() => setShowSuccessScreen(false)} />
    </div>
  );
}