"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  collection, query, where, getDocs, 
  updateDoc, doc, getDoc, setDoc, serverTimestamp,
  onSnapshot, orderBy, runTransaction, increment
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

import GlobalNotification from "@/app/components/GlobalNotification";
import BusinessNavbar from "@/app/components/BusinessNavbar";
import ReviewSubmissionModal from "@/app/components/ReviewSubmissionModal";
import UpgradeTrigger from "@/app/components/dashboard/UpgradeTrigger"; 
import UpgradeSuccess from "@/app/components/dashboard/UpgradeSuccess"; // New Success Component

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
  Loader2
} from "lucide-react";

export default function BusinessDashboard() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState({});
  const [activeChats, setActiveChats] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [businessProfile, setBusinessProfile] = useState(null);
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedCampaignForReview, setSelectedCampaignForReview] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState("");

  // PLAN CHANGE LISTENER STATES
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const lastKnownPlan = useRef(null); // Using a Ref to track plan without re-renders until needed

  const fundFromWallet = async (campaign) => {
    const currentBalance = businessProfile?.walletBalance || 0;
    if (currentBalance < campaign.budget) {
      alert(`Insufficient funds. Your balance is ₦${currentBalance.toLocaleString()}. Please top up.`);
      return;
    }
    if (!confirm(`Use ₦${campaign.budget.toLocaleString()} from your wallet to fund "${campaign.title}"?`)) return;

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
      alert("Transaction failed.");
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
    if (!window.PaystackPop) {
      alert("Payment infrastructure loading. Please wait a moment.");
      return;
    }
    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: auth.currentUser?.email,
      amount: campaign.budget * 100,
      currency: "NGN",
      metadata: { type: "campaign_payment", campaignId: campaign.id, businessId: auth.currentUser?.uid },
      callback: function(response) { alert("Payment Authorized. Reference: " + response.reference); },
    });
    handler.openIframe();
  };

  const startConversation = async (creatorId, campaignId, creatorName) => {
    const businessId = auth.currentUser.uid;
    const chatId = `${businessId}_${creatorId}_${campaignId}`;
    try {
      const chatRef = doc(db, "chats", chatId);
      const chatData = {
        chatId: chatId,
        participants: [businessId, creatorId],
        businessId: businessId,
        creatorId: creatorId,
        campaignId: campaignId,
        businessName: businessProfile.companyName,
        creatorName: creatorName,
        lastMessage: "Conversation started",
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };
      await setDoc(chatRef, chatData, { merge: true });
      router.push(`/dashboard/chat/${chatId}`);
    } catch (err) {
      console.error("❌ Chat initiation error:", err);
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
            
            // --- PLAN CHANGE LISTENER LOGIC ---
            // If we have a stored plan from earlier in THIS session, and it changes to 'pro'
            if (lastKnownPlan.current === 'marketplace' && data.plan === 'pro') {
              setShowSuccessScreen(true);
            }
            
            // Update the tracker ref so next time we know what it was
            lastKnownPlan.current = data.plan;
            setBusinessProfile(data);
          } else {
            setLoading(false);
          }
        });

        const q = query(collection(db, "campaigns"), where("businessId", "==", user.uid));
        const unsubscribeCampaigns = onSnapshot(q, (snap) => {
            const campaignList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setCampaigns(campaignList);
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

        setLoading(false);
        return () => { unsubscribeBiz(); unsubscribeChats(); unsubscribeCampaigns(); unsubscribeApps(); };
      } catch (err) {
        console.error("Dashboard error:", err);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9fafb]">
      <Loader2 className="h-10 w-10 animate-spin text-[#22c55e]" />
      <p className="mt-4 text-sm font-semibold text-gray-500">Loading your workspace...</p>
    </div>
  );

  if (!businessProfile) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#001E00] antialiased relative">
      <GlobalNotification targetType="businesses" />
      <BusinessNavbar 
        companyName={businessProfile.companyName} 
        balance={businessProfile.walletBalance} 
      />

      {/* FIXED UPGRADE TRIGGER & STATUS BADGE */}
      <UpgradeTrigger />

      {/* --- DASHBOARD HEADER --- */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-2">
                Good day, {businessProfile.companyName}
              </h1>
              <p className="text-gray-500 text-lg">Manage your campaigns and talent in one place.</p>
            </div>
            <button 
                onClick={() => router.push("/dashboard/business/create-campaign")} 
                className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
                <Plus className="h-4 w-4 text-[#22c55e]" /> Post a Campaign
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* --- LEFT SIDE: MANAGEMENT --- */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* ACTIVE CHANNELS (MESSAGES) */}
            <section>
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-lg font-bold">Recent messages</h3>
                <button className="text-sm font-bold text-[#22c55e] hover:underline">View all</button>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {activeChats.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {activeChats.slice(0, 3).map((chat) => (
                      <div 
                        key={chat.id} 
                        onClick={() => router.push(`/dashboard/chat/${chat.id}`)}
                        className="p-5 hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-4 group"
                      >
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 font-bold border border-gray-200 group-hover:border-[#22c55e]">
                          {chat.creatorName?.[0] || "C"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-bold text-gray-900 truncate">{chat.creatorName}</h4>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active</span>
                          </div>
                          <p className="text-sm text-gray-500 truncate italic">"{chat.lastMessage || "Click to start chatting..."}"</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-[#22c55e]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <MessageSquare className="h-8 w-8 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-400">No active messages yet.</p>
                  </div>
                )}
              </div>
            </section>

            {/* CAMPAIGN INVENTORY */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                 <h3 className="text-lg font-bold">Your Campaigns</h3>
              </div>
              
              {campaigns.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-20 text-center">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No campaigns created yet.</p>
                </div>
              ) : (
                campaigns.map((c) => {
                  const isEscrowed = c.paymentStatus === "escrow_locked";
                  const isReleased = c.paymentStatus === "released";
                  const isInReview = c.status === "in_review";
                  const hasBalance = (businessProfile?.walletBalance || 0) >= c.budget;

                  return (
                    <div key={c.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
                      <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider border border-gray-200">{c.platform}</span>
                              {isReleased ? (
                                <span className="text-emerald-600 text-[10px] font-bold uppercase flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Completed</span>
                              ) : isInReview ? (
                                <span className="text-[#22c55e] text-[10px] font-bold uppercase flex items-center gap-1 animate-pulse"><Sparkles className="h-3 w-3" /> Review Content</span>
                              ) : isEscrowed ? (
                                <span className="text-blue-600 text-[10px] font-bold uppercase flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Funds in Escrow</span>
                              ) : (
                                <span className="text-amber-600 text-[10px] font-bold uppercase flex items-center gap-1"><CreditCard className="h-3 w-3" /> Draft / Unfunded</span>
                              )}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{c.title}</h2>
                            <p className="text-gray-500 text-sm line-clamp-2 mb-4">{c.description}</p>
                            
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Budget</p>
                                    <p className="font-bold text-gray-900">₦{c.budget?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Applicants</p>
                                    <p className="font-bold text-gray-900">{applications[c.id]?.length || 0}</p>
                                </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row md:flex-col justify-end gap-3 min-w-[180px]">
                            {isInReview ? (
                              <button onClick={() => { setSelectedCampaignForReview(c); setIsReviewModalOpen(true); }} className="w-full bg-black text-[#22c55e] py-3 rounded-full text-xs font-bold uppercase flex items-center justify-center gap-2">
                                <Eye className="h-3.5 w-3.5" /> Review & Pay
                              </button>
                            ) : !isEscrowed && !isReleased ? (
                              hasBalance ? (
                                <button onClick={() => fundFromWallet(c)} className="w-full bg-black text-[#22c55e] py-3 rounded-full text-xs font-bold uppercase flex items-center justify-center gap-2 shadow-lg">
                                  <Zap className="h-3 w-3 fill-current" /> Use Wallet
                                </button>
                              ) : (
                                <button onClick={() => handlePayment(c)} className="w-full bg-[#22c55e] text-black py-3 rounded-full text-xs font-bold uppercase flex items-center justify-center gap-2">
                                  <CreditCard className="h-3 w-3" /> Fund Escrow
                                </button>
                              )
                            ) : isEscrowed ? (
                              <div className="flex flex-col gap-2">
                                <div className="text-center py-2 px-4 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase border border-emerald-100">
                                    Funds Secured
                                </div>
                                <button onClick={() => toggleCampaignStatus(c.id, c.status)} className="w-full border border-gray-200 py-2 rounded-full text-[10px] font-bold uppercase hover:border-black transition-all">
                                    Settings
                                </button>
                              </div>
                            ) : (
                              <div className="text-center py-2 px-4 bg-gray-50 text-gray-400 rounded-full text-[10px] font-bold uppercase border border-gray-100">
                                Archive
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* APPLICANTS ACCORDION STYLE */}
                      <div className="bg-[#fcfcfc] border-t border-gray-100 p-6 md:p-8">
                        <div className="space-y-4">
                          {applications[c.id]?.length > 0 ? (
                            applications[c.id].map((a) => (
                              <div key={a.id} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 border border-gray-200">
                                    {a.creatorData.name[0]}
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-sm text-gray-900">{a.creatorData.name}</h4>
                                      <p className="text-[10px] text-gray-400 font-bold uppercase">{a.status} • {new Date(a.appliedAt?.seconds * 1000).toLocaleDateString()}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 w-full md:w-auto">
                                  {a.status === "pending" ? (
                                    <>
                                      <button onClick={() => handleUpdateStatus(c.id, a.id, "accepted")} className="flex-1 md:flex-none px-5 py-2 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-wider">Accept</button>
                                      <button onClick={() => handleUpdateStatus(c.id, a.id, "rejected")} className="flex-1 md:flex-none px-5 py-2 border border-gray-200 text-gray-500 rounded-full text-[10px] font-bold uppercase hover:bg-red-50 hover:text-red-500 transition-all">Decline</button>
                                    </>
                                  ) : a.status === "accepted" ? (
                                    <button onClick={() => startConversation(a.creatorId, c.id, a.creatorData.name)} className="w-full md:w-auto bg-white border border-gray-200 text-black px-5 py-2 rounded-full text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:border-black transition-all">
                                      <MessageSquare className="h-3 w-3" /> Message
                                    </button>
                                  ) : (
                                    <span className="text-[10px] font-bold text-gray-300 uppercase px-4">Closed</span>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-gray-400 text-[10px] font-bold uppercase tracking-widest">Awaiting Applications...</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </section>
          </div>

          {/* --- RIGHT SIDE: WALLET & STATS --- */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                  <Wallet className="h-5 w-5 text-gray-400" />
                  <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest">Your Wallet</h3>
              </div>
              
              <div className="mb-8">
                <p className="text-3xl font-bold text-gray-900 mb-1">₦{(businessProfile?.walletBalance || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-400 font-semibold uppercase">Total Balance Available</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₦</span>
                    <input 
                        type="number"
                        placeholder="Amount"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-[#22c55e] transition-all"
                    />
                </div>
                <button 
                    onClick={initiateTopUp}
                    className="w-full bg-black text-[#22c55e] py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    Top up Wallet <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Security</span>
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                    Funds are secured by UseMyCreator Escrow. Money is only released when content is approved.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* MODALS */}
      {selectedCampaignForReview && (
          <ReviewSubmissionModal 
            isOpen={isReviewModalOpen}
            onClose={() => { setIsReviewModalOpen(false); setSelectedCampaignForReview(null); }}
            campaign={selectedCampaignForReview}
          />
      )}

      {/* SUCCESS CELEBRATION OVERLAY */}
      <UpgradeSuccess 
        isOpen={showSuccessScreen} 
        onClose={() => setShowSuccessScreen(false)} 
      />
    </div>
  );
}