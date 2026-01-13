"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

export default function BusinessDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const loadBusinessData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // 1. Verify Business Profile exists
        const profileSnap = await getDoc(doc(db, "businesses", user.uid));
        
        if (!profileSnap.exists()) {
          setHasProfile(false);
        } else {
          setHasProfile(true);
          // 2. Fetch only THIS business's campaigns
          const q = query(collection(db, "campaigns"), where("businessId", "==", user.uid));
          const snap = await getDocs(q);
          setCampaigns(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBusinessData();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  // Redirect if profile missing
  if (!hasProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-2xl font-bold mb-4">Complete your business profile first</h1>
        <button onClick={() => router.push("/dashboard/business/setup")} className="bg-[#a3dcf3] px-6 py-3 rounded-xl font-bold">
          Setup Profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-gray-900">Command Center</h1>
        <button 
          onClick={() => alert("We will build the 'Create Campaign' form next!")}
          className="bg-black text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-transform"
        >
          + Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Active Campaigns</p>
          <h2 className="text-3xl font-black mt-2">{campaigns.length}</h2>
        </div>
        {/* We can add 'Total Applications' and 'Spent' cards here later */}
      </div>

      <h3 className="text-2xl font-bold mb-6">Your Campaigns</h3>
      <div className="space-y-4">
        {campaigns.length > 0 ? (
          campaigns.map(camp => (
            <div key={camp.id} className="bg-white p-6 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
              <div>
                <h4 className="font-bold text-lg">{camp.title}</h4>
                <p className="text-sm text-gray-500">{camp.platform} • Budget: ${camp.budget}</p>
              </div>
              <button className="text-sm font-bold text-blue-600 hover:underline">
                View Applications →
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed">
            <p className="text-gray-500">No campaigns yet. Post your first job to see creators!</p>
          </div>
        )}
      </div>
    </div>
  );
}