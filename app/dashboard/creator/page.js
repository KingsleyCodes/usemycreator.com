"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function CreatorDashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [appliedCampaigns, setAppliedCampaigns] = useState({});
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // 1️⃣ Fetch active campaigns
        const campaignQuery = query(
          collection(db, "campaigns"),
          where("status", "==", "active")
        );
        const campaignSnap = await getDocs(campaignQuery);

        const campaignList = campaignSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setCampaigns(campaignList);

        // 2️⃣ Fetch creator's applications
        const appQuery = query(
          collection(db, "applications"),
          where("creatorId", "==", user.uid)
        );
        const appSnap = await getDocs(appQuery);

        const appliedMap = {};
        appSnap.docs.forEach((doc) => {
          appliedMap[doc.data().campaignId] = doc.data().status;
        });

        setAppliedCampaigns(appliedMap);
      } catch (err) {
        console.error("Creator dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // 🔹 APPLY TO CAMPAIGN
  const applyToCampaign = async (campaignId) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setApplyingId(campaignId);

      await addDoc(collection(db, "applications"), {
        campaignId,
        creatorId: user.uid,
        status: "pending",
        appliedAt: serverTimestamp(),
      });

      setAppliedCampaigns((prev) => ({
        ...prev,
        [campaignId]: "pending",
      }));
    } catch (err) {
      console.error("Apply error:", err);
      alert("Failed to apply. Try again.");
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading campaigns...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-8">
      <h1 className="text-2xl font-bold">Available Campaigns</h1>

      {campaigns.length === 0 && (
        <p>No active campaigns right now.</p>
      )}

      {campaigns.map((c) => {
        const status = appliedCampaigns[c.id];

        return (
          <div key={c.id} className="border p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-1">{c.title}</h2>
            <p className="mb-2">{c.description}</p>

            <div className="text-sm text-gray-600 mb-4">
              Platform: {c.platform} • Budget: ₦{c.budget}
            </div>

            {status ? (
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                  status === "pending"
                    ? "bg-yellow-200"
                    : status === "accepted"
                    ? "bg-green-300"
                    : "bg-red-300"
                }`}
              >
                {status.toUpperCase()}
              </span>
            ) : (
              <button
                onClick={() => applyToCampaign(c.id)}
                disabled={applyingId === c.id}
                className="bg-[#a3dcf3] px-4 py-2 rounded font-semibold"
              >
                {applyingId === c.id ? "Applying..." : "Apply"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
