"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CreateCampaign() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "campaigns"), {
        businessId: auth.currentUser.uid,
        title,
        description,
        contentType,
        createdAt: serverTimestamp(),
      });
      alert("Campaign created!");
      router.push("/dashboard/business");
    } catch (err) {
      console.error(err);
      alert("Failed to create campaign. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Create Campaign</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border p-3 rounded"
          placeholder="Campaign Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full border p-3 rounded"
          placeholder="Campaign Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="w-full border p-3 rounded"
          placeholder="Content Type (e.g., TikTok video, Instagram post)"
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#a3dcf3] p-3 rounded font-semibold"
        >
          {loading ? "Creating..." : "Create Campaign"}
        </button>
      </form>
    </div>
  );
}
