"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

import CreatorNavbar from "@/app/components/CreatorNavbar";
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ExternalLink, 
  Loader2,
  MessageSquare,
  AlertCircle,
  ArrowRight
} from "lucide-react";

export default function CreatorJobsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push("/login");

      // Fetch Creator Profile
      const userDoc = await getDoc(doc(db, "creators", user.uid));
      if (userDoc.exists()) setUserData(userDoc.data());

      // Fetch ONLY ACCEPTED Applications (These are the active Jobs)
      const q = query(
        collection(db, "applications"),
        where("creatorId", "==", user.uid),
        where("status", "==", "accepted")
      );

      const unsubscribeApps = onSnapshot(q, async (snapshot) => {
        // FIX: Handle empty state immediately to prevent infinite loading
        if (snapshot.empty) {
          setJobs([]);
          setLoading(false);
          return;
        }

        try {
          const jobsData = await Promise.all(
            snapshot.docs.map(async (d) => {
              const app = { id: d.id, ...d.data() };
              const campDoc = await getDoc(doc(db, "campaigns", app.campaignId));
              return { 
                ...app, 
                campaign: campDoc.exists() ? campDoc.data() : null 
              };
            })
          );
          setJobs(jobsData);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching jobs:", err);
          setLoading(false);
        }
      }, (err) => {
        console.error("Snapshot failed:", err);
        setLoading(false);
      });

      return () => unsubscribeApps();
    });

    return () => unsubscribeAuth();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="h-10 w-10 animate-spin text-[#22c55e]" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-4">Opening Workspace...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#001E00] antialiased">
      <CreatorNavbar creatorName={userData?.name} balance={userData?.balance || 0} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* HEADER SECTION */}
        <div className="mb-12">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
            Active <span className="text-[#22c55e]">Work.</span>
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                <Briefcase className="h-3 w-3" /> {jobs.length} Hired Projects
            </p>
            <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22c55e]">
                Deliverables Due
            </p>
          </div>
        </div>

        {/* JOBS TABLE */}
        <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Campaign / Brand</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Agreed Rate</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Milestone</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.length > 0 ? (
                  jobs.map((job) => (
                    <tr key={job.id} className="group hover:bg-gray-50/30 transition-colors">
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                            <FileText className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-gray-900 uppercase tracking-tighter text-base group-hover:text-[#22c55e] transition-colors truncate">
                              {job.campaign?.title || "Project Brief"}
                            </p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              Reference: {job.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <p className="text-base font-black text-gray-900">₦{job.bidAmount?.toLocaleString() || "0"}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#22c55e]"></div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Verified Escrow</p>
                        </div>
                      </td>
                      <td className="p-8 text-center">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-[#22c55e] border border-emerald-100">
                          <Clock className="h-3 w-3" /> In Production
                        </span>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <button 
                                onClick={() => router.push(`/dashboard/chat/${job.businessId}_${auth.currentUser.uid}_${job.campaignId}`)}
                                className="p-4 bg-black text-[#22c55e] rounded-2xl hover:scale-105 transition-all shadow-lg active:scale-95"
                                title="Open Chat"
                            >
                                <MessageSquare className="h-4 w-4" />
                            </button>
                            <button 
                                onClick={() => router.push(`/dashboard/creator/jobs/${job.id}`)}
                                className="p-4 bg-white border border-gray-200 text-gray-400 rounded-2xl hover:border-[#22c55e] hover:text-[#22c55e] transition-all"
                                title="Full Brief"
                            >
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-32 text-center">
                      <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-10 w-10 text-gray-200" />
                      </div>
                      <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-400">Zero active gigs</h3>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-2">Win a proposal to see your hired jobs here.</p>
                      <button 
                        onClick={() => router.push("/dashboard/creator")}
                        className="mt-8 px-10 py-4 bg-black text-[#22c55e] rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                      >
                        Browse Marketplace
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER CALL TO ACTION */}
        <div className="mt-12 bg-black rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <CheckCircle2 className="h-64 w-64 text-[#22c55e]" />
          </div>
          <div className="flex-1 relative z-10 text-center md:text-left">
            <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">
                Secure your <span className="text-[#22c55e]">Payout.</span>
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xl font-medium">
              Ready to submit? Head to the workspace and upload your links. Once the brand approves, your funds are instantly moved to your available balance.
            </p>
          </div>
          <button 
            onClick={() => router.push('/dashboard/creator/wallet')}
            className="relative z-10 bg-[#22c55e] text-black px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#22c55e]/20"
          >
            My Wallet
          </button>
        </div>
      </main>
    </div>
  );
}