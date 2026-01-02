"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

export default function BusinessDashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // ✅ CREATE CAMPAIGN
  const createCampaign = async (user) => {
    try {
      setCreating(true);

      const docRef = await addDoc(collection(db, "campaigns"), {
        title: "Instagram Brand Awareness",
        description: "Create 1 reel and 2 story posts promoting our product",
        platform: "Instagram",
        budget: 75000,
        status: "active",
        businessId: user.uid,
        createdAt: serverTimestamp(),
      });

      setCampaigns((prev) => [
        {
          id: docRef.id,
          title: "Instagram Brand Awareness",
          description: "Create 1 reel and 2 story posts promoting our product",
          platform: "Instagram",
          budget: 75000,
          status: "active",
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("Create campaign error:", err);
    } finally {
      setCreating(false);
    }
  };

  // ✅ FETCH DATA (AUTH-SAFE)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch campaigns
        const q = query(
          collection(db, "campaigns"),
          where("businessId", "==", user.uid)
        );

        const snap = await getDocs(q);
        const campaignList = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setCampaigns(campaignList);

        // Fetch applications
        const apps = {};

        for (const c of campaignList) {
          const appQuery = query(
            collection(db, "applications"),
            where("campaignId", "==", c.id)
          );
          const appSnap = await getDocs(appQuery);

          apps[c.id] = [];

          for (const a of appSnap.docs) {
            const appData = a.data();

            const creatorSnap = await getDoc(
              doc(db, "creators", appData.creatorId)
            );

            const creatorData = creatorSnap.exists()
              ? creatorSnap.data()
              : { name: "Unknown", skills: [] };

            apps[c.id].push({
              id: a.id,
              ...appData,
              creatorData,
            });
          }
        }

        setApplications(apps);
      } catch (err) {
        console.error("Business dashboard error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading business dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-10">
      <button
        onClick={() => createCampaign(auth.currentUser)}
        disabled={creating}
        className="bg-black text-white px-5 py-2 rounded-lg font-semibold"
      >
        {creating ? "Creating..." : "Create Test Campaign"}
      </button>

      {campaigns.map((c) => (
        <div key={c.id} className="border p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-2">{c.title}</h2>
          <p className="mb-4">{c.description}</p>

          <h3 className="font-semibold mb-2">Applicants</h3>

          {applications[c.id]?.length ? (
            <div className="space-y-2">
              {applications[c.id].map((a) => (
                <div
                  key={a.id}
                  className="flex justify-between items-center border p-3 rounded"
                >
                  <div>
                    <p className="font-medium">{a.creatorData.name}</p>
                    <p className="text-sm">
                      Skills: {a.creatorData.skills?.join(", ")}
                    </p>
                    <p className="text-sm italic">Status: {a.status}</p>
                  </div>

                  {a.status === "pending" && (
                    <div className="space-x-2">
                      <button
                        onClick={() =>
                          updateDoc(doc(db, "applications", a.id), {
                            status: "accepted",
                          })
                        }
                        className="bg-[#a3dcf3] px-3 py-1 rounded font-semibold"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() =>
                          updateDoc(doc(db, "applications", a.id), {
                            status: "rejected",
                          })
                        }
                        className="bg-gray-300 px-3 py-1 rounded font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No applicants yet.</p>
          )}
        </div>
      ))}
    </div>
  );
}
