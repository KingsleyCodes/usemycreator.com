"use client";

import { useEffect, useState } from "react";
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
  Eye // Added for the review button
} from "lucide-react";

export default function BusinessDashboard() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState({});
  const [activeChats, setActiveChats] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [businessProfile, setBusinessProfile] = useState(null);
  
  // MODAL STATES
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedCampaignForReview, setSelectedCampaignForReview] = useState(null);

  // Wallet Top-up State
  const [topUpAmount, setTopUpAmount] = useState("");

  // ✅ 1. INTERNAL WALLET FUNDING (Atomic Transaction)
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

        // Deduct from Wallet
        transaction.update(bizRef, {
          walletBalance: increment(-campaign.budget),
          updatedAt: serverTimestamp()
        });

        // Update Campaign
        transaction.update(campaignRef, {
          paymentStatus: "escrow_locked",
          status: "open",
          fundedVia: "internal_wallet",
          updatedAt: serverTimestamp()
        });

        // Log Transaction
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

  // ✅ 2. WALLET TOP-UP INITIALIZATION
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
          metadata: {
            type: "wallet_topup",
            businessId: auth.currentUser.uid
          }
        }),
      });

      const data = await res.json();
      if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      }
    } catch (err) {
      alert("Could not initiate top-up.");
    }
  };

  // ✅ RELEASE FUNDS TRIGGER (Legacy - mostly handled by Review Modal now)
  const releaseFunds = async (campaignId) => {
    if (!confirm("Are you 100% happy with the content? This will send the money to the creator's wallet and cannot be undone.")) return;

    try {
      const res = await fetch("/api/campaigns/release-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          campaignId, 
          businessId: auth.currentUser.uid 
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Success! Funds have been moved to the creator's wallet.");
      } else {
        alert(data.error || "Failed to release funds.");
      }
    } catch (err) {
      alert("System error. Please try again.");
    }
  };

  // ✅ PAYSTACK PAYMENT HANDLER (Direct Campaign)
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
      metadata: {
        type: "campaign_payment",
        campaignId: campaign.id,
        businessId: auth.currentUser?.uid,
      },
      callback: function(response) {
        alert("Payment Authorized. Reference: " + response.reference);
      },
    });

    handler.openIframe();
  };

  // ✅ START CONVERSATION FUNCTION
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

  // ✅ TOGGLE CAMPAIGN STATUS
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
        // Real-time Business Profile Listener
        const unsubscribeBiz = onSnapshot(doc(db, "businesses", user.uid), (snap) => {
          if (snap.exists()) setBusinessProfile(snap.data());
          else setLoading(false);
        });

        // 1. Fetch campaigns
        const q = query(collection(db, "campaigns"), where("businessId", "==", user.uid));
        const unsubscribeCampaigns = onSnapshot(q, (snap) => {
            const campaignList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setCampaigns(campaignList);
        });

        // 2. Fetch applications
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

        // 3. Real-time Chat Listener
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
            unsubscribeBiz();
            unsubscribeChats();
            unsubscribeCampaigns();
            unsubscribeApps();
        };

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
                status: "assigned" // Explicitly move status to assigned
            });
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="h-10 w-10 bg-black rounded flex items-center justify-center animate-pulse mb-4">
        <Sparkles className="h-6 w-6 text-[#a3dcf3]" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Syncing Portfolio...</p>
    </div>
  );

  if (!businessProfile) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900">
      <GlobalNotification targetType="businesses" />
      <BusinessNavbar companyName={businessProfile.companyName} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* --- TOP SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-2">
                <Layers className="h-4 w-4 text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Management Console</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                Studio <span className="text-gray-400">Operations.</span>
            </h1>
          </div>

          <div className="bg-black rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <Wallet className="h-4 w-4 text-[#a3dcf3]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Available Funds</span>
                </div>
                <h2 className="text-3xl font-black mb-6">₦{(businessProfile?.walletBalance || 0).toLocaleString()}</h2>
                <div className="flex gap-2">
                    <input 
                        type="number"
                        placeholder="₦ Amount"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        className="bg-white/10 border-none rounded-xl px-4 py-2 text-xs font-bold w-full outline-none focus:bg-white/20 transition-all placeholder:text-gray-600"
                    />
                    <button 
                        onClick={initiateTopUp}
                        className="bg-[#a3dcf3] text-black p-3 rounded-xl hover:scale-105 transition-all"
                    >
                        <ArrowUpRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
          </div>
        </div>

        {/* --- ACTIVE CHANNELS --- */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#a3dcf3]" /> Active Secure Channels
            </h3>
            <button 
                onClick={() => router.push("/dashboard/business/create-campaign")} 
                className="bg-black text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2"
            >
                <Plus className="h-4 w-4" /> New Campaign
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeChats.length > 0 ? (
              activeChats.map((chat) => (
                <div 
                  key={chat.id} 
                  onClick={() => router.push(`/dashboard/chat/${chat.id}`)}
                  className="bg-white border border-gray-100 rounded-[1.5rem] p-5 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center text-[#a3dcf3] font-black text-sm">
                      {chat.creatorName?.[0] || "C"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-gray-900 truncate text-sm uppercase tracking-tight">{chat.creatorName}</h4>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Workspace Active</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-600 line-clamp-1 font-medium italic">"{chat.lastMessage || "No messages yet..."}"</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white border border-dashed border-gray-200 rounded-[2rem] p-12 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No active secure channels initiated</p>
              </div>
            )}
          </div>
        </div>

        {/* --- CAMPAIGNS --- */}
        <div className="space-y-12 pt-8 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-2">
             <TrendingUp className="h-4 w-4 text-gray-400" />
             <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Campaign Inventory</h3>
          </div>
          {campaigns.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-20 text-center">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No active deployments found</p>
            </div>
          ) : (
            campaigns.map((c) => {
              const isEscrowed = c.paymentStatus === "escrow_locked";
              const isReleased = c.paymentStatus === "released";
              const isInReview = c.status === "in_review";
              const hasBalance = (businessProfile?.walletBalance || 0) >= c.budget;

              return (
                <div 
                  key={c.id} 
                  className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all ${c.status === 'inactive' ? 'opacity-60' : ''}`}
                >
                  <div className="p-6 sm:p-8 border-b border-gray-100 bg-white">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="bg-gray-900 text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tighter">{c.platform}</span>
                          
                          {isReleased ? (
                            <span className="bg-[#a3dcf3]/20 text-black border border-[#a3dcf3]/40 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Funds Released
                            </span>
                          ) : isInReview ? (
                            <span className="bg-black text-[#a3dcf3] px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 animate-pulse">
                                <Sparkles className="h-3 w-3" /> Proof Submitted
                            </span>
                          ) : isEscrowed ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" /> Escrow Secured
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1">
                                <CreditCard className="h-3 w-3" /> Payment Required
                            </span>
                          )}
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">{c.title}</h2>
                        <p className="text-gray-500 text-sm max-w-3xl leading-relaxed">{c.description}</p>
                      </div>
                      
                      <div className="w-full lg:w-auto flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4 p-4 lg:p-0 bg-gray-50 lg:bg-transparent rounded-xl">
                          <div className="text-left lg:text-right">
                              <p className="text-[10px] font-bold text-gray-400 uppercase">Total Budget</p>
                              <p className="text-2xl font-black text-gray-900">₦{c.budget?.toLocaleString()}</p>
                          </div>

                          {/* DYNAMIC ACTION BUTTONS */}
                          {isInReview ? (
                            <button 
                                onClick={() => {
                                    setSelectedCampaignForReview(c);
                                    setIsReviewModalOpen(true);
                                }}
                                className="flex items-center gap-2 text-[10px] font-black uppercase py-4 px-8 bg-black text-[#a3dcf3] rounded-xl hover:scale-105 transition-all shadow-xl shadow-[#a3dcf3]/10 border border-[#a3dcf3]/20"
                            >
                                <Eye className="h-3.5 w-3.5" /> Review & Pay
                            </button>
                          ) : !isEscrowed && !isReleased ? (
                            hasBalance ? (
                              <button 
                                onClick={() => fundFromWallet(c)} 
                                className="flex items-center gap-2 text-[10px] font-black uppercase py-3 px-6 bg-black text-[#a3dcf3] rounded-lg hover:scale-105 transition-all shadow-md"
                              >
                                <Zap className="h-3 w-3 fill-current" /> Pay with Wallet
                              </button>
                            ) : (
                              <button 
                                onClick={() => handlePayment(c)} 
                                className="flex items-center gap-2 text-[10px] font-bold uppercase py-3 px-6 bg-[#a3dcf3] text-black rounded-lg hover:bg-black hover:text-white transition-all shadow-md"
                              >
                                <CreditCard className="h-3 w-3" /> Secure Escrow
                              </button>
                            )
                          ) : isEscrowed ? (
                            <div className="flex gap-2">
                                <div className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-100 flex items-center gap-2">
                                    <ShieldCheck className="h-3 w-3" /> Secured
                                </div>
                                <button 
                                    onClick={() => toggleCampaignStatus(c.id, c.status)} 
                                    className="flex items-center gap-2 text-[10px] font-bold uppercase py-2 px-3 bg-white border border-gray-200 rounded-md hover:border-black transition-all"
                                >
                                    <Settings2 className="h-3 w-3" />
                                </button>
                            </div>
                          ) : (
                            <div className="text-[10px] font-black uppercase text-gray-400 border border-gray-200 px-4 py-2 rounded-lg">
                                Completed
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Applicant Tracker */}
                  <div className="bg-white p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900">Applicant Tracking</h3>
                      <div className="flex-1 h-[1px] bg-gray-100"></div>
                    </div>
                    
                    <div className="space-y-4">
                      {applications[c.id]?.length > 0 ? (
                        applications[c.id].map((a) => (
                          <div key={a.id} className="flex flex-col md:flex-row items-center justify-between p-6 rounded-xl border border-gray-100 hover:border-gray-300 transition-all group bg-[#FDFDFD]">
                            <div className="flex items-center gap-6 w-full md:w-auto">
                              <div className="h-12 w-12 rounded-lg bg-gray-900 flex items-center justify-center font-bold text-white shadow-sm">{a.creatorData.name[0]}</div>
                              <div>
                                  <h4 className="font-bold text-gray-900 text-lg leading-none mb-1">{a.creatorData.name}</h4>
                                  <div className="flex items-center gap-2">
                                      <span className={`text-[10px] font-bold uppercase ${a.status === 'accepted' ? 'text-emerald-600' : 'text-amber-600'}`}>{a.status}</span>
                                      <span className="text-[10px] text-gray-300">•</span>
                                      <span className="text-[10px] font-medium text-gray-400 italic">Applied {new Date(a.appliedAt?.seconds * 1000).toLocaleDateString()}</span>
                                  </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 mt-6 md:mt-0 w-full md:w-auto">
                              {a.status === "pending" ? (
                                <>
                                  <button onClick={() => handleUpdateStatus(c.id, a.id, "accepted")} className="flex-1 md:flex-none bg-[#a3dcf3] text-black px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm">Accept</button>
                                  <button onClick={() => handleUpdateStatus(c.id, a.id, "rejected")} className="flex-1 md:flex-none bg-white text-gray-400 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest border border-gray-200 hover:bg-red-50 hover:text-red-500 transition-all">Decline</button>
                                </>
                              ) : (
                                <div className="flex items-center gap-3 w-full justify-end">
                                  {a.status === "accepted" && (
                                    <button onClick={() => startConversation(a.creatorId, c.id, a.creatorData.name)} className="w-full md:w-auto bg-black text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-800 transition-all">
                                      <MessageSquare className="h-4 w-4 text-[#a3dcf3]" /> Open Workspace
                                    </button>
                                  )}
                                  {a.status === "rejected" && (
                                    <div className="flex items-center gap-2 text-gray-300 px-4 py-2 bg-gray-50 rounded-lg">
                                      <XCircle className="h-4 w-4" />
                                      <span className="text-[10px] font-bold uppercase tracking-widest">Rejected</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Awaiting talent submissions</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* REVIEW MODAL INTEGRATION */}
      {selectedCampaignForReview && (
          <ReviewSubmissionModal 
            isOpen={isReviewModalOpen}
            onClose={() => {
                setIsReviewModalOpen(false);
                setSelectedCampaignForReview(null);
            }}
            campaign={selectedCampaignForReview}
          />
      )}
    </div>
  );
}