"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  getDocs,
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
  ArrowUpRight, 
  FileText, 
  Search,
  Filter,
  MoreHorizontal,
  ExternalLink,
  Loader2
} from "lucide-react";

export default function CreatorJobsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, accepted, rejected

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch Creator Profile for Navbar
      const userDoc = await getDoc(doc(db, "creators", user.uid));
      if (userDoc.exists()) setUserData(userDoc.data());

      // Fetch Applications with Real-time listener
      const q = query(
        collection(db, "applications"),
        where("creatorId", "==", user.uid)
      );

      const unsubscribeApps = onSnapshot(q, async (snapshot) => {
        const appsData = await Promise.all(
          snapshot.docs.map(async (d) => {
            const app = { id: d.id, ...d.data() };
            // Fetch associated campaign details
            const campDoc = await getDoc(doc(db, "campaigns", app.campaignId));
            return { ...app, campaign: campDoc.exists() ? campDoc.data() : null };
          })
        );
        setApplications(appsData);
        setLoading(false);
      });

      return () => unsubscribeApps();
    });

    return () => unsubscribeAuth();
  }, [router]);

  const filteredApps = applications.filter(app => 
    filter === "all" ? true : app.status === filter
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="h-8 w-8 animate-spin text-[#108a00]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#001E00] antialiased">
      <CreatorNavbar creatorName={userData?.name} balance={userData?.balance || 0} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        
        {/* HEADER & FILTER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-2">
              My <span className="text-gray-400 italic">Proposals.</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
              <FileText className="h-3 w-3" /> Tracking {applications.length} active engagements
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
            {['all', 'pending', 'accepted', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === status 
                  ? 'bg-black text-white shadow-lg' 
                  : 'text-gray-400 hover:text-black hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {[
            { label: "Total Sent", value: applications.length, color: "text-gray-900" },
            { label: "Active", value: applications.filter(a => a.status === 'accepted').length, color: "text-[#108a00]" },
            { label: "Pending", value: applications.filter(a => a.status === 'pending').length, color: "text-amber-500" },
            { label: "Rejected", value: applications.filter(a => a.status === 'rejected').length, color: "text-red-400" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* APPLICATIONS TABLE / LIST */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="p-6 md:p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Campaign Brief</th>
                  <th className="p-6 md:p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Proposed Budget</th>
                  <th className="p-6 md:p-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Status</th>
                  <th className="p-6 md:p-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredApps.length > 0 ? (
                  filteredApps.map((app) => (
                    <tr key={app.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="p-6 md:p-8">
                        <div className="max-w-xs md:max-w-md">
                          <p className="font-bold text-gray-900 uppercase tracking-tight text-sm mb-1 group-hover:text-[#108a00] transition-colors">
                            {app.campaign?.title || "Unknown Campaign"}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400 uppercase">
                            <Clock className="h-3 w-3" /> Applied {app.appliedAt?.seconds ? new Date(app.appliedAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                          </div>
                        </div>
                      </td>
                      <td className="p-6 md:p-8">
                        <p className="text-sm font-black text-gray-900">₦{app.campaign?.budget?.toLocaleString() || "0"}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Fixed Price</p>
                      </td>
                      <td className="p-6 md:p-8 text-center">
                        <span className={`inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          app.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          app.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-6 md:p-8 text-right">
                        <button 
                          onClick={() => router.push(`/dashboard/creator`)}
                          className="p-3 bg-gray-50 rounded-xl hover:bg-black hover:text-white transition-all text-gray-400"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-24 text-center">
                      <Briefcase className="h-10 w-10 text-gray-100 mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">No proposals found in this category</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* UPWORK-STYLE TIP FOOTER */}
        <div className="mt-12 bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-gray-200/30">
          <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-8 w-8 text-[#108a00]" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="font-serif text-xl font-medium mb-2">Want to win more accepted proposals?</h4>
            <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
              Creators who follow up with a direct message to the brand after applying have a **45% higher acceptance rate**. 
              Use your active channels to introduce yourself and share your vision for the campaign.
            </p>
          </div>
          <button 
            onClick={() => router.push('/dashboard/creator')}
            className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#108a00] transition-all shadow-xl shadow-black/10"
          >
            Find More Jobs
          </button>
        </div>
      </main>
    </div>
  );
}