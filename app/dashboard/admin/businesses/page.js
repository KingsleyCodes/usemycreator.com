"use client";

import { useState } from "react";
import { useAdminData } from "../useAdminData";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Building2, 
  Ban, 
  Mail, 
  Search, 
  Globe, 
  ShieldAlert,
  X,
  ExternalLink
} from "lucide-react";

export default function BusinessesAdminPage() {
  const { businesses, loading } = useAdminData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  // --- ACTIONS RETAINED FROM YOUR ORIGINAL DASHBOARD ---
  const toggleBanStatus = async (userId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'Lift Ban' : 'Ban'} this business?`)) return;
    try {
      await updateDoc(doc(db, "businesses", userId), { isBanned: !currentStatus });
    } catch (err) { alert("Error updating ban status."); }
  };

  const filteredBusinesses = businesses.filter(b => 
    b.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center text-[#108a00] font-bold text-xs tracking-widest uppercase">
      Accessing Business Directory...
    </div>
  );

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-[#001e00] tracking-tight">Business Partners</h1>
          <p className="text-sm text-gray-500 font-medium">Monitoring {businesses.length} corporate entities.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search company or email..."
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm w-full md:w-80 outline-none focus:border-[#108a00] transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* BUSINESS TABLE */}
      <div className="bg-white rounded-[1.5rem] border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-5 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Company Details</th>
                <th className="p-5 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Security Status</th>
                <th className="p-5 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Database ID</th>
                <th className="p-5 text-[11px] font-bold uppercase text-gray-400 text-right tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBusinesses.map((biz) => (
                <tr key={biz.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm group-hover:bg-[#001e00] group-hover:text-white transition-all">
                        {biz.companyName?.[0] || <Building2 className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#001e00] uppercase tracking-tight">{biz.companyName || "Unnamed Biz"}</p>
                        <p className="text-[11px] text-gray-400 font-medium">{biz.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    {biz.isBanned ? (
                      <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100 uppercase tracking-tighter">Banned / Restricted</span>
                    ) : (
                      <span className="text-[9px] font-bold text-[#108a00] bg-green-50 px-2 py-1 rounded border border-green-100 uppercase tracking-tighter">Active Partner</span>
                    )}
                  </td>
                  <td className="p-5">
                    <p className="text-[10px] font-mono text-gray-400 uppercase">{biz.id.slice(0, 12)}...</p>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setSelectedBusiness(biz)}
                        className="p-2 text-gray-400 hover:text-[#108a00] hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => toggleBanStatus(biz.id, biz.isBanned)}
                        className={`p-2 rounded-lg transition-all ${biz.isBanned ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBusinesses.length === 0 && (
            <div className="p-20 text-center text-gray-400 text-sm font-medium">
              No business entities found for "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* BUSINESS INSPECTOR MODAL */}
      {selectedBusiness && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#001e00]/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-[#001e00] tracking-tight">Business Profile</h2>
              <button 
                onClick={() => setSelectedBusiness(null)} 
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 rounded-[1.5rem] bg-[#001e00] flex items-center justify-center font-bold text-3xl text-white">
                  {selectedBusiness.companyName?.[0]}
                </div>
                <div>
                  <p className="font-bold text-2xl text-[#001e00]">{selectedBusiness.companyName}</p>
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {selectedBusiness.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Company Website</p>
                   <div className="flex items-center gap-2 text-[#108a00] font-bold text-sm">
                      <Globe className="h-4 w-4" />
                      {selectedBusiness.website || "No website provided"}
                   </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-6 rounded-[1.5rem]">
                <div className="flex items-center gap-2 text-amber-800 mb-2">
                  <ShieldAlert className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-wider">Administrative Control</p>
                </div>
                <p className="text-xs text-amber-700/80 font-medium mb-4">
                  Banning this business will immediately terminate their ability to fund campaigns or release escrow payments.
                </p>
                <button 
                  onClick={() => {
                    toggleBanStatus(selectedBusiness.id, selectedBusiness.isBanned);
                    setSelectedBusiness(null);
                  }}
                  className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${selectedBusiness.isBanned ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
                >
                  {selectedBusiness.isBanned ? 'Lift All Restrictions' : 'Restrict Business Access'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}