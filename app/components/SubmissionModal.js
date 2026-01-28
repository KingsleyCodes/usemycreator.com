"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { X, Link2, Plus, Trash2, Send } from "lucide-react";

export default function SubmissionModal({ campaign, isOpen, onClose }) {
  const [links, setLinks] = useState([""]); // Array to hold dynamic link inputs
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add a new empty link field
  const addLinkField = () => setLinks([...links, ""]);

  // Update a specific link field by index
  const handleLinkChange = (index, value) => {
    const updatedLinks = [...links];
    updatedLinks[index] = value;
    setLinks(updatedLinks);
  };

  // Remove a specific link field
  const removeLinkField = (index) => {
    if (links.length > 1) {
      setLinks(links.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validLinks = links.filter((link) => link.trim() !== "");

    if (validLinks.length === 0) {
      return alert("Please provide at least one valid link.");
    }

    setIsSubmitting(true);
    try {
      const campaignRef = doc(db, "campaigns", campaign.id);
      
      // Update the campaign document with the proof
      await updateDoc(campaignRef, {
        submissionLinks: validLinks,
        status: "in_review", // This signals the Business Owner to check it
        submittedAt: serverTimestamp(),
      });

      alert("Deliverables transmitted successfully!");
      onClose();
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 relative animate-in fade-in zoom-in duration-200 shadow-2xl">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-black">
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">
            Transmit <span className="text-[#a3dcf3]">Deliverables.</span>
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
            Campaign: {campaign.title}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {links.map((link, index) => (
              <div key={index} className="flex gap-2 group">
                <div className="relative flex-1">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-hover:text-[#a3dcf3] transition-colors" />
                  <input
                    type="url"
                    required
                    placeholder="Paste social link here..."
                    className="w-full pl-12 p-4 bg-gray-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#a3dcf3] transition-all"
                    value={link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                  />
                </div>
                {links.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLinkField(index)}
                    className="p-4 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addLinkField}
            className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 font-black text-[10px] uppercase tracking-widest hover:border-[#a3dcf3] hover:text-[#a3dcf3] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="h-3 w-3" /> Add Another Link
          </button>

          <div className="pt-6 border-t border-gray-50">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#a3dcf3] hover:text-black transition-all disabled:opacity-20 flex items-center justify-center gap-3 shadow-xl"
            >
              {isSubmitting ? "Processing..." : "Submit for Approval"} <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}