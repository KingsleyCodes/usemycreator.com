"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc,
  deleteDoc,
  orderBy
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

import CreatorNavbar from "@/app/components/CreatorNavbar";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Briefcase, 
  Loader2, 
  ArrowLeft,
  Trash2,
  Check
} from "lucide-react";

export default function MyApplications() {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); 
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [isWithdrawing, setIsWithdrawing] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push("/login");

      // Fetch Profile
      const profileSnap = await getDoc(doc(db, "creators", user.uid));
      if (profileSnap.exists()) setCreatorProfile(profileSnap.data());

      // Fetch Applications
      const q = query(
        collection(db, "applications"),
        where("creatorId", "==", user.uid),
        orderBy("appliedAt", "desc")
      );

      const unsubscribeApps = onSnapshot(q, async (snapshot) => {
        // FIX: If no applications exist, stop loading immediately
        if (snapshot.empty) {
          setApplications([]);
          setLoading(false);
          return;
        }

        try {
          const appsData = await Promise.all(
            snapshot.docs.map(async (applicationDoc) => {
              const app = { id: applicationDoc.id, ...applicationDoc.data() };
              const campaignSnap = await getDoc(doc(db, "campaigns", app.campaignId));
              return {
                ...app,
                campaignDetails: campaignSnap.exists() ? campaignSnap.data() : null
              };
            })
          );
          
          setApplications(appsData);
          setLoading(false);
        } catch (err) {
          console.error("Error mapping apps:", err);
          setLoading(false);
        }
      }, (error) => {
        console.error("Snapshot error:", error);
        setLoading(false); // Stop loading even if there's a permission/index error
      });

      return () => unsubscribeApps();
    });

    return () => unsubscribeAuth();
  }, [router]);

  const handleWithdraw = async (appId) => {
    const confirmWithdraw = window.confirm("Are you sure you want to withdraw this proposal?");
    if (!confirmWithdraw) return;

    try {
      setIsWithdrawing(appId);
      await deleteDoc(doc(db, "applications", appId));
      
      // Show Success Notification
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      
    } catch (error) {
      console.error("Error withdrawing proposal:", error);
      alert("Failed to withdraw proposal.");
    } finally {
      setIsWithdrawing(null);
    }
  };

  const filteredApps = applications.filter(app => 
    filter === "all" ? true : app.status === filter
  );

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="h-10 w-10 animate-spin text-[#22c55e]" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-4">Syncing Proposals...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#001E00] antialiased">
      <CreatorNavbar creatorName={creatorProfile?.name} balance={creatorProfile?.balance || 0} />

      {/* WITHDRAWAL NOTIFICATION TOAST */}
      {showNotification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-black text-white px-6 py-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="h-6 w-6 bg-[#22c55e] rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-black" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest">Proposal Withdrawn Successfully</p>
        </div>
      )}

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <button 
            onClick={() => router.push("/dashboard/creator")}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Studio
          </button>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Your <span className="text-[#22c55e]">Proposals.</span></h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Manage your active bids and brand responses</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* FILTER BAR */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-2 bg-white border border-gray-200 p-1.5 rounded-2xl shadow-sm">
                {["all", "pending", "accepted", "rejected"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            filter === status 
                            ? "bg-[#22c55e] text-black shadow-lg shadow-[#22c55e]/20" 
                            : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white border border-gray-200 px-4 py-2 rounded-full">
                {filteredApps.length} Entries
            </div>
        </div>

        {/* APPLICATIONS LIST */}
        <div className="space-y-4">
          {filteredApps.length > 0 ? (
            filteredApps.map((app) => (
              <div 
                key={app.id} 
                className="bg-white border border-gray-200 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 hover:border-[#22c55e] transition-all group shadow-sm hover:shadow-xl hover:shadow-[#22c55e]/5"
              >
                <div className="flex items-center gap-6 flex-1 w-full">
                    <div className={`h-16 w-16 min-w-[64px] rounded-3xl flex items-center justify-center border-2 transition-all ${
                        app.status === 'accepted' ? 'bg-[#22c55e]/10 border-[#22c55e]/30 text-[#15803d]' :
                        app.status === 'rejected' ? 'bg-red-50 border-red-100 text-red-400' :
                        'bg-gray-50 border-gray-100 text-gray-300'
                    }`}>
                        {app.status === 'accepted' ? <CheckCircle2 className="h-7 w-7" /> : 
                         app.status === 'rejected' ? <XCircle className="h-7 w-7" /> : 
                         <Clock className="h-7 w-7" />}
                    </div>
                    
                    <div className="min-w-0">
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900 leading-none mb-2 truncate">
                            {app.campaignDetails?.title || "Project Brief"}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[10px] font-black text-[#22c55e] uppercase bg-[#22c55e]/5 px-2 py-1 rounded">Bid: ₦{app.bidAmount?.toLocaleString() || "0"}</span>
                            <span className="h-1 w-1 bg-gray-200 rounded-full hidden sm:block"></span>
                            <span className="text-[10px] font-black text-gray-400 uppercase">
                                Applied {app.appliedAt?.seconds ? new Date(app.appliedAt.seconds * 1000).toLocaleDateString() : 'Processing...'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {app.status === "accepted" ? (
                        <button 
                            onClick={() => router.push(`/dashboard/chat/${app.businessId}_${auth.currentUser.uid}_${app.campaignId}`)}
                            className="w-full md:w-auto px-8 py-4 bg-black text-[#22c55e] rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-900 transition-all active:scale-95 shadow-xl shadow-[#22c55e]/10"
                        >
                            <MessageSquare className="h-4 w-4" /> Open Workspace
                        </button>
                    ) : app.status === "pending" ? (
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="flex-1 md:flex-none px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-amber-50 border border-amber-100 text-amber-600 text-center">
                                Reviewing
                            </div>
                            <button
                                onClick={() => handleWithdraw(app.id)}
                                disabled={isWithdrawing === app.id}
                                className="p-4 bg-red-50 text-red-500 rounded-2xl border border-red-100 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center group/btn"
                                title="Withdraw Proposal"
                            >
                                {isWithdrawing === app.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-gray-50 border border-gray-100 text-gray-400 w-full md:w-auto text-center">
                            Archive
                        </div>
                    )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-[3rem] py-32 text-center">
                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="h-8 w-8 text-gray-200" />
                </div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-400">No proposals yet</h3>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-2">Active bids will appear here for tracking.</p>
                <button 
                    onClick={() => router.push("/dashboard/creator")}
                    className="mt-8 px-8 py-3 bg-black text-[#22c55e] rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                >
                    Browse Campaigns
                </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}