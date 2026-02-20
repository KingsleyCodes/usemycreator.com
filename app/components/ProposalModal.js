"use client";

import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { X, Link2, Plus, Trash2, Send, Wallet, FileText, BarChart3 } from "lucide-react";

export default function ProposalModal({ campaign, isOpen, onClose, creatorProfile }) {
  const [bidAmount, setBidAmount] = useState(campaign?.budget || "");
  const [coverLetter, setCoverLetter] = useState("");
  const [links, setLinks] = useState([""]); // For portfolio/analytics proof
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
    
    if (!auth.currentUser) return alert("Please log in to submit a proposal.");
    
    const validLinks = links.filter((link) => link.trim() !== "");

    if (coverLetter.length < 50) {
      return alert("Please provide a more detailed cover letter (at least 50 characters).");
    }

    setIsSubmitting(true);
    try {
      // UPWORK STYLE: We create a NEW application document instead of just updating the campaign
      const proposalData = {
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        businessId: campaign.businessId,
        creatorId: auth.currentUser.uid,
        creatorName: creatorProfile?.name || "Creator",
        creatorPhoto: creatorProfile?.photoURL || "",
        bidAmount: Number(bidAmount),
        coverLetter: coverLetter,
        portfolioLinks: validLinks,
        status: "pending", // Initial state for business review
        appliedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "applications"), proposalData);

      alert("Proposal submitted successfully! The business will review your pitch.");
      onClose();
    } catch (err) {
      console.error("Proposal Submission Error:", err);
      alert("Failed to send proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-8 md:p-12 relative animate-in fade-in zoom-in duration-200 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors">
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
            Submit Your <span className="text-[#22c55e]">Proposal.</span>
          </h2>
          <div className="flex items-center gap-2 mt-3">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
               Pitching for: {campaign.title}
             </p>
             <span className="h-1 w-1 rounded-full bg-gray-200"></span>
             <p className="text-[10px] font-bold text-[#22c55e] uppercase tracking-[0.2em]">
               Budget: ₦{campaign.budget?.toLocaleString()}
             </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* BID SECTION */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
              <Wallet className="h-3 w-3" /> Your Proposed Rate (₦)
            </label>
            <div className="relative">
                <input
                  type="number"
                  required
                  placeholder="Enter your bid amount..."
                  className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl text-lg font-bold outline-none focus:border-[#22c55e] focus:bg-white transition-all"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                />
                <p className="mt-2 text-[9px] text-gray-400 font-medium italic">
                  * You can bid higher or lower than the business budget based on your value.
                </p>
            </div>
          </div>

          {/* COVER LETTER SECTION */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
              <FileText className="h-3 w-3" /> Cover Letter / Why You?
            </label>
            <textarea
              required
              rows={5}
              placeholder="Tell the business why you are the perfect fit. Mention your strategy for this campaign..."
              className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-medium outline-none focus:border-[#22c55e] focus:bg-white transition-all resize-none"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>

          {/* PROOF/PORTFOLIO SECTION */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
              <BarChart3 className="h-3 w-3" /> Relevant Links (Analytics or Portfolio)
            </label>
            <div className="space-y-3">
              {links.map((link, index) => (
                <div key={index} className="flex gap-2 group">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-hover:text-[#22c55e] transition-colors" />
                    <input
                      type="url"
                      required
                      placeholder="https://instagram.com/p/..."
                      className="w-full pl-14 p-5 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#22c55e] transition-all"
                      value={link}
                      onChange={(e) => handleLinkChange(index, e.target.value)}
                    />
                  </div>
                  {links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLinkField(index)}
                      className="p-5 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
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
              className="w-full py-5 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 font-black text-[10px] uppercase tracking-widest hover:border-[#22c55e] hover:text-[#22c55e] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="h-3 w-3" /> Add Another Link
            </button>
          </div>

          {/* SUBMIT SECTION */}
          <div className="pt-8 border-t border-gray-50">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#22c55e] hover:text-black transition-all disabled:opacity-20 flex items-center justify-center gap-3 shadow-xl"
            >
              {isSubmitting ? "Transmitting Proposal..." : "Send Proposal to Business"} <Send className="h-4 w-4" />
            </button>
            <p className="text-center mt-4 text-[9px] text-gray-400 uppercase tracking-widest font-bold">
              Secure Submission Powered by UseMyCreator
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}