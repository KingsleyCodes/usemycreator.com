"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { 
  doc, getDoc, collection, 
  query, where, getDocs, addDoc, serverTimestamp 
} from "firebase/firestore";

export default function CreatorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const initializeDashboard = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      setUser(currentUser);

      try {
        // 1. Check if Creator Profile exists in the 'creators' collection
        const profileSnap = await getDoc(doc(db, "creators", currentUser.uid));
        
        if (profileSnap.exists()) {
          setHasProfile(true);
          // 2. Fetch Active Campaigns only if they have a profile
          const q = query(collection(db, "campaigns"), where("status", "==", "active"));
          const querySnapshot = await getDocs(q);
          const campaignList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCampaigns(campaignList);
        }
      } catch (error) {
        console.error("Dashboard initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  const handleApply = async (campaignId, businessId) => {
    try {
      await addDoc(collection(db, "applications"), {
        campaignId,
        businessId,
        creatorId: user.uid,
        status: "pending",
        appliedAt: serverTimestamp(),
      });
      alert("Application submitted! The brand will be notified.");
    } catch (err) {
      alert("Failed to apply. Please try again.");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-medium">Loading Marketplace...</div>;

  // IF NO PROFILE: Show a Call-to-Action to your new /setup route
  if (!hasProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 max-w-lg">
          <h1 className="text-4xl font-black mb-4">You're almost there! 🚀</h1>
          <p className="text-gray-500 mb-8 text-lg">
            Before you can view the marketplace and apply for campaigns, you need to set up your professional creator profile.
          </p>
          <button 
            onClick={() => router.push("/dashboard/creator/setup")}
            className="w-full bg-[#a3dcf3] py-4 rounded-2xl font-bold text-xl hover:shadow-lg transition-all"
          >
            Create My Profile
          </button>
        </div>
      </div>
    );
  }

  // IF PROFILE EXISTS: Show the professional Marketplace
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10">
      <header className="mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Marketplace</h1>
        <p className="text-gray-500 text-xl mt-3">Exclusive opportunities for top creators.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {campaigns.map((job) => (
          <div key={job.id} className="group bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">
                {job.platform}
              </span>
              <span className="text-3xl font-black text-gray-900">${job.budget}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{job.title}</h3>
            <p className="text-gray-500 text-base leading-relaxed line-clamp-3 mb-8">{job.description}</p>
            
            <button 
              onClick={() => handleApply(job.id, job.businessId)}
              disabled={user.uid === job.businessId}
              className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
                user.uid === job.businessId 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-black text-white hover:scale-[1.02] active:scale-95 shadow-lg"
              }`}
            >
              {user.uid === job.businessId ? "Owner View" : "Apply Now"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}