"use client";

import { useState } from "react";
import { useAdminData } from "../useAdminData";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Trash2, 
  Search, 
  X, 
  Building2, 
  User as UserIcon,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export default function CampaignsAdminPage() {
  const { campaigns, creators, businesses, loading } = useAdminData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // --- HELPERS RETAINED FROM ORIGINAL DASHBOARD ---
  const getBusinessName = (id) => businesses.find(b => b.id === id)?.companyName || "Unknown Business";
  const getCreatorName = (id) => creators.find(c => c.id === id)?.name || "Not Assigned Yet";

  // --- ACTIONS RETAINED FROM ORIGINAL DASHBOARD ---
  const releaseFunds = async (campaign) => {
    if (!confirm(`ADMIN OVERRIDE: Release ₦${campaign.budget.toLocaleString()} to ${getCreatorName(campaign.assignedCreatorId)}?`)) return;

    try {
      const res = await fetch("/api/campaigns/release-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          campaignId: campaign.id, 
          businessId: campaign.businessId 
        }),
      });

      if (res.ok) {
        alert("Escrow Released Successfully.");
        setSelectedCampaign(null);
      } else {
        const data = await res.json();
        alert(data.error || "Release failed.");
      }
    } catch (err) {
      alert("System Error: Could not connect to release API.");
    }
  };

  const deleteCampaign = async (id) => {
    if (!confirm("Permanently delete this campaign? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "campaigns", id));
      setSelectedCampaign(null);
    } catch (err) { alert("Error deleting campaign."); }
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getBusinessName(c.businessId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center text-[#108a00] font-bold text-xs tracking-widest uppercase">
      Loading Escrow Database...
    </div>
  );

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-[#001e00] tracking-tight">Campaign Escrow</h1>
          <p className="text-sm text-gray-500 font-medium">Monitoring {campaigns.length} active contracts and fund locks.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search campaigns or brands..."
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm w-full md:w-80 outline-none focus:border-[#108a00] transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* CAMPAIGNS TABLE */}
      <div className="bg-white rounded-[1.5rem] border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-5 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Campaign & Platform</th>
                <th className="p-5 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Financial Status</th>
                <th className="p-5 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Stakeholders</th>
                <th className="p-5 text-[11px] font-bold uppercase text-gray-400 text-right tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCampaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="p-5">
                    <p className="font-bold text-sm text-[#001e00] uppercase tracking-tight">{c.title}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-widest">{c.platform}</p>
                  </td>
                  <td className="p-5">
                    <p className="text-sm font-bold text-[#001e00]">₦{c.budget?.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {c.paymentStatus === 'escrow_locked' ? (
                        <span className="text-[9px] font-bold text-[#108a00] bg-green-50 px-2 py-0.5 rounded border border-green-100 flex items-center gap-1 uppercase tracking-tighter">
                          <ShieldCheck className="h-2 w-2" /> Escrow Locked
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 flex items-center gap-1 uppercase tracking-tighter">
                          <Clock className="h-2 w-2" /> {c.paymentStatus || 'Pending'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Business: <span className="text-gray-700">{getBusinessName(c.businessId)}</span></p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Creator: <span className="text-[#108a00]">{getCreatorName(c.assignedCreatorId)}</span></p>
                  </td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => setSelectedCampaign(c)}
                      className="text-xs font-bold text-[#108a00] hover:underline"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CAMPAIGN MODAL */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#001e00]/20 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="bg-white border border-gray-200 w-full max-w-xl rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-[#001e00]">{selectedCampaign.title}</h2>
              <button onClick={() => setSelectedCampaign(null)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"><X className="h-4 w-4" /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-1 text-gray-400">
                    <Building2 className="h-3 w-3" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Client</p>
                  </div>
                  <p className="font-bold text-sm text-[#001e00]">{getBusinessName(selectedCampaign.businessId)}</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-1 text-gray-400">
                    <UserIcon className="h-3 w-3" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Creator</p>
                  </div>
                  <p className="font-bold text-sm text-[#108a00]">{getCreatorName(selectedCampaign.assignedCreatorId)}</p>
                </div>
              </div>

              <div className="bg-[#f0f9ff] border border-[#bae6fd] p-6 rounded-[1.5rem] flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest mb-1">Financial State</p>
                  <p className="font-bold text-[#001e00] capitalize text-lg">{selectedCampaign.paymentStatus?.replace('_', ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest mb-1">Contract Value</p>
                  <p className="text-3xl font-bold text-[#001e00]">₦{selectedCampaign.budget?.toLocaleString()}</p>
                </div>
              </div>

              {selectedCampaign.paymentStatus === 'escrow_locked' && !selectedCampaign.assignedCreatorId && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                  <p className="text-[11px] text-amber-700 font-medium">Funds are locked, but no creator is assigned. You cannot release funds until a creator is linked to this contract.</p>
                </div>
              )}

              <div className="flex gap-3">
                {selectedCampaign.paymentStatus === 'escrow_locked' && selectedCampaign.assignedCreatorId && (
                    <button 
                        onClick={() => releaseFunds(selectedCampaign)}
                        className="flex-1 bg-[#108a00] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#0d7000] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                    >
                        <CheckCircle className="h-4 w-4" /> Release Funds to Creator
                    </button>
                )}
                <button 
                    onClick={() => deleteCampaign(selectedCampaign.id)} 
                    className="px-6 bg-red-50 text-red-600 rounded-xl font-bold text-sm border border-red-100 hover:bg-red-100 transition-all flex items-center gap-2"
                >
                    <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}