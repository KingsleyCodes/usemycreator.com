"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  collection, query, where, getDocs, 
  updateDoc, doc, getDoc, setDoc, serverTimestamp,
  onSnapshot, orderBy 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

import GlobalNotification from "@/app/components/GlobalNotification";
import BusinessNavbar from "@/app/components/BusinessNavbar";
import { 
  Plus, 
  Settings2, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  TrendingUp,
  Sparkles
} from "lucide-react";

export default function BusinessDashboard() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState({});
  const [activeChats, setActiveChats] = useState([]); // New state for chats
  const [loading, setLoading] = useState(true);
  const [businessProfile, setBusinessProfile] = useState(null);

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
      setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: newStatus } : c));
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push("/login");

      try {
        const bizSnap = await getDoc(doc(db, "businesses", user.uid));
        if (!bizSnap.exists()) {
          setLoading(false);
          return; 
        }
        setBusinessProfile(bizSnap.data());

        // 1. Fetch campaigns
        const q = query(collection(db, "campaigns"), where("businessId", "==", user.uid));
        const snap = await getDocs(q);
        const campaignList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCampaigns(campaignList);

        // 2. Fetch applications
        if (campaignList.length > 0) {
          const appsMap = {};
          const appQuery = query(collection(db, "applications"), where("businessId", "==", user.uid));
          const appSnap = await getDocs(appQuery);

          for (const a of appSnap.docs) {
            const appData = a.data();
            const creatorSnap = await getDoc(doc(db, "creators", appData.creatorId));
            const creatorData = creatorSnap.exists() ? creatorSnap.data() : { name: "Unknown Creator" };

            if (!appsMap[appData.campaignId]) appsMap[appData.campaignId] = [];
            appsMap[appData.campaignId].push({ id: a.id, ...appData, creatorData });
          }
          setApplications(appsMap);
        }

        // 3. REAL-TIME CHAT LISTENER (Sorted by Recency)
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
        console.error("Dashboard error:", err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleUpdateStatus = async (campaignId, appId, newStatus) => {
    try {
      await updateDoc(doc(db, "applications", appId), { status: newStatus });
      setApplications(prev => ({
        ...prev,
        [campaignId]: prev[campaignId].map(app => 
          app.id === appId ? { ...app, status: newStatus } : app
        )
      }));
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

  if (!businessProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tighter uppercase">Deployment Pending</h1>
        <p className="text-gray-500 text-sm mb-8 max-w-xs">Your business profile requires initialization before campaign deployment.</p>
        <button 
          onClick={() => router.push("/dashboard/business/setup")} 
          className="bg-black text-white px-8 py-4 rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-gray-800 transition-all"
        >
          Initialize Setup
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900">
      <GlobalNotification targetType="businesses" />
      <BusinessNavbar companyName={businessProfile.companyName} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* HEADER SECTION */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <Layers className="h-4 w-4 text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Management Console</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                Studio <span className="text-gray-400">Operations.</span>
            </h1>
          </div>
          <button 
            onClick={() => router.push("/dashboard/business/create-campaign")} 
            className="bg-black text-white px-8 py-4 rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New Campaign
          </button>
        </div>

        {/* --- SECTION 1: ACTIVE CHANNELS (Rearranged to Top) --- */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#a3dcf3]" /> Active Secure Channels
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Communication Hub</span>
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

        {/* --- SECTION 2: CAMPAIGNS (Below Chats) --- */}
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
            campaigns.map((c) => (
              <div 
                key={c.id} 
                className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all ${c.status === 'inactive' ? 'opacity-60' : ''}`}
              >
                {/* Campaign Info Bar */}
                <div className="p-6 sm:p-8 border-b border-gray-100 bg-white">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-gray-900 text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tighter">{c.platform}</span>
                        <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tighter border ${
                            c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}>
                            {c.status}
                        </span>
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">{c.title}</h2>
                      <p className="text-gray-500 text-sm max-w-3xl leading-relaxed">{c.description}</p>
                    </div>
                    
                    <div className="w-full lg:w-auto flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4 p-4 lg:p-0 bg-gray-50 lg:bg-transparent rounded-xl">
                        <div className="text-left lg:text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Budget</p>
                            <p className="text-2xl font-black text-gray-900">₦{c.budget?.toLocaleString()}</p>
                        </div>
                        <button 
                            onClick={() => toggleCampaignStatus(c.id, c.status)} 
                            className="flex items-center gap-2 text-[10px] font-bold uppercase py-2 px-3 bg-white border border-gray-200 rounded-md hover:border-black transition-all"
                        >
                            <Settings2 className="h-3 w-3" /> Status
                        </button>
                    </div>
                  </div>
                </div>

                {/* Applications Section */}
                <div className="bg-white p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900">Applicant Tracking</h3>
                    <div className="flex-1 h-[1px] bg-gray-100"></div>
                  </div>
                  
                  <div className="space-y-4">
                    {applications[c.id]?.length > 0 ? (
                      applications[c.id].map((a) => (
                        <div 
                          key={a.id} 
                          className="flex flex-col md:flex-row items-center justify-between p-6 rounded-xl border border-gray-100 hover:border-gray-300 transition-all group bg-[#FDFDFD]"
                        >
                          <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className="h-12 w-12 rounded-lg bg-gray-900 flex items-center justify-center font-bold text-white shadow-sm">
                                {a.creatorData.name[0]}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg leading-none mb-1">{a.creatorData.name}</h4>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold uppercase ${a.status === 'accepted' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {a.status}
                                    </span>
                                    <span className="text-[10px] text-gray-300">•</span>
                                    <span className="text-[10px] font-medium text-gray-400 italic">Applied {new Date(a.appliedAt?.seconds * 1000).toLocaleDateString()}</span>
                                </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-6 md:mt-0 w-full md:w-auto">
                            {a.status === "pending" ? (
                              <>
                                <button 
                                  onClick={() => handleUpdateStatus(c.id, a.id, "accepted")} 
                                  className="flex-1 md:flex-none bg-[#a3dcf3] text-black px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm"
                                >
                                  Accept
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(c.id, a.id, "rejected")} 
                                  className="flex-1 md:flex-none bg-white text-gray-400 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest border border-gray-200 hover:bg-red-50 hover:text-red-500 transition-all"
                                >
                                  Decline
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center gap-3 w-full justify-end">
                                {a.status === "accepted" && (
                                  <button 
                                    onClick={() => startConversation(a.creatorId, c.id, a.creatorData.name)}
                                    className="w-full md:w-auto bg-black text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-800 transition-all"
                                  >
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
            ))
          )}
        </div>
      </main>
    </div>
  );
}