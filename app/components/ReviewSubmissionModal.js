"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment, serverTimestamp, runTransaction } from "firebase/firestore";
import { X, ExternalLink, CheckCircle, AlertCircle, Loader2, ShieldAlert } from "lucide-react";

export default function ReviewSubmissionModal({ campaign, isOpen, onClose }) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !campaign) return null;

  const handleApprove = async () => {
    const confirmRelease = confirm("Confirming this will immediately release the budget to the creator. This action cannot be undone. Proceed?");
    if (!confirmRelease) return;

    setIsProcessing(true);
    try {
      const campaignRef = doc(db, "campaigns", campaign.id);
      const creatorRef = doc(db, "creators", campaign.assignedCreatorId);

      // Use a Transaction to ensure the money moves safely
      await runTransaction(db, async (transaction) => {
        // 1. Update Campaign Status
        transaction.update(campaignRef, {
          status: "completed",
          paymentStatus: "released",
          approvedAt: serverTimestamp()
        });

        // 2. Move money to Creator's liquid balance
        transaction.update(creatorRef, {
          balance: increment(campaign.budget)
        });
      });

      alert("Funds released! Campaign marked as completed.");
      onClose();
    } catch (err) {
      console.error("Payout Error:", err);
      alert("Error processing payout. Please check your connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt("Why are you requesting a revision? (The creator will see this note)");
    if (!reason) return;

    setIsProcessing(true);
    try {
      const campaignRef = doc(db, "campaigns", campaign.id);
      await updateDoc(campaignRef, {
        status: "assigned", // Send it back to the 'assigned' state so they can resubmit
        adminNote: reason,
        rejectedAt: serverTimestamp()
      });
      alert("Revision requested. Creator has been notified.");
      onClose();
    } catch (err) {
      alert("Error updating status.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFlagDispute = async () => {
    const reason = prompt("Describe the dispute. This will freeze the funds and notify the UseMyCreator admin team:");
    if (!reason) return;

    setIsProcessing(true);
    try {
      const campaignRef = doc(db, "campaigns", campaign.id);
      await updateDoc(campaignRef, {
        status: "disputed",
        disputeReason: reason,
        disputedAt: serverTimestamp(),
        disputedBy: "business",
        paymentStatus: "escrow_locked" // Ensure funds remain locked
      });
      alert("Campaign flagged for dispute. Our team will review the deliverables and mediate the payout.");
      onClose();
    } catch (err) {
      console.error("Dispute Error:", err);
      alert("Error flagging dispute.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl p-10 relative animate-in zoom-in duration-200">
        
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors">
          <X className="h-6 w-6" />
        </button>

        <div className="mb-10">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Review <span className="text-[#22c55e]">Deliverables.</span></h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Campaign ID: {campaign.id}</p>
        </div>

        <div className="space-y-6 mb-10">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Submitted Assets:</p>
          <div className="grid grid-cols-1 gap-3">
            {campaign.submissionLinks?.map((link, index) => (
              <a 
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-[#22c55e]/10 transition-all border border-transparent hover:border-[#22c55e]"
              >
                <span className="text-sm font-bold text-gray-900 truncate pr-4">{link}</span>
                <ExternalLink className="h-4 w-4 text-gray-400 shrink-0" />
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-8 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <button 
              disabled={isProcessing}
              onClick={handleReject}
              className="flex items-center justify-center gap-2 py-5 rounded-2xl border-2 border-gray-100 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-orange-50 hover:text-orange-600 hover:border-orange-100 transition-all"
            >
              <AlertCircle className="h-4 w-4" /> Request Revision
            </button>

            <button 
              disabled={isProcessing}
              onClick={handleApprove}
              className="flex items-center justify-center gap-2 py-5 rounded-2xl bg-black text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-black/10"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              {isProcessing ? "Processing..." : "Approve & Pay"}
            </button>
          </div>

          <button 
            disabled={isProcessing}
            onClick={handleFlagDispute}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-red-400 font-black text-[9px] uppercase tracking-[0.2em] hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <ShieldAlert className="h-3 w-3" /> Flag Dispute to Admin
          </button>
        </div>
      </div>
    </div>
  );
}