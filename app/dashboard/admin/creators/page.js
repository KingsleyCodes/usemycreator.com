"use client";

import { useState } from "react";
import { useAdminData } from "../useAdminData"; // Custom hook for live data
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  ShieldCheck, 
  Ban, 
  User as UserIcon, 
  X, 
  Search,
  CheckCircle,
  ExternalLink,
  MoreVertical
} from "lucide-react";

export default function CreatorsAdminPage() {
  const { creators, loading } = useAdminData();
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // --- ACTIONS RETAINED FROM YOUR ORIGINAL DASHBOARD ---
  const toggleBanStatus = async (userId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'Unban' : 'Ban'} this creator?`)) return;
    try {
      await updateDoc(doc(db, "creators", userId), { isBanned: !currentStatus });
    } catch (err) { alert("Error updating ban status."); }
  };

  const toggleVerification = async (userId, currentStatus) => {
    try {
      await updateDoc(doc(db, "creators", userId), { isVerified: !currentStatus });
    } catch (err) { alert("Error updating verification."); }
  };

  // Filter logic for the search bar
  const filteredCreators = creators.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center text-[#108a00] font-bold text-xs tracking-widest uppercase">
      Loading Creator Database...
    </div>
  );

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-[#001e00] tracking-tight">Creator Network</h1>
          <p className="text-sm text-gray-500 font-medium">Manage verification, balances, and security for {creators.length} creators.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm w-full md:w-80 outline-none focus:border-[#108a00] transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[1.5rem] border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-5 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Creator Identity</th>
                <th className="p-5 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Status & Trust</th>
                <th className="p-5 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Financials</th>
                <th className="p-5 text-[11px] font-bold uppercase text-gray-400 text-right tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCreators.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#108a00]/10 flex items-center justify-center font-bold text-[#108a00] text-sm group-hover:bg-[#108a00] group-hover:text-white transition-all">
                        {user.name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#001e00] uppercase tracking-tight">{user.name}</p>
                        <p className="text-[11px] text-gray-400 font-medium lowercase">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-wrap gap-2">
                      {user.isVerified ? (
                        <span className="text-[9px] font-bold text-[#108a00] bg-green-50 px-2 py-1 rounded border border-green-100 flex items-center gap-1"><CheckCircle className="h-2 w-2" /> VERIFIED</span>
                      ) : (
                        <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100 uppercase tracking-tighter">Standard</span>
                      )}
                      {user.isBanned && (
                        <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100 uppercase tracking-tighter">Banned</span>
                      )}
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="text-sm font-bold text-[#001e00]">₦{user.balance?.toLocaleString() || 0}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Available</p>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setSelectedCreator(user)} 
                        className="p-2 text-gray-400 hover:text-[#108a00] hover:bg-gray-100 rounded-lg transition-all"
                        title="View Full Profile"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => toggleBanStatus(user.id, user.isBanned)} 
                        className={`p-2 rounded-lg transition-all ${user.isBanned ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}
                        title={user.isBanned ? "Lift Ban" : "Ban Creator"}
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCreators.length === 0 && (
            <div className="p-20 text-center text-gray-400 text-sm font-medium">
              No creators found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* CREATOR INSPECTOR MODAL (Full Logic Retained) */}
      {selectedCreator && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#001e00]/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-[#001e00] tracking-tight">Creator Dossier</h2>
              <button 
                onClick={() => setSelectedCreator(null)} 
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 rounded-[1.5rem] bg-[#108a00] flex items-center justify-center font-bold text-3xl text-white shadow-lg shadow-green-900/20">
                  {selectedCreator.name?.[0]}
                </div>
                <div>
                  <p className="font-bold text-2xl text-[#001e00]">{selectedCreator.name}</p>
                  <p className="text-sm text-gray-500 font-medium">{selectedCreator.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Earnings</p>
                   <p className="text-2xl font-bold text-[#108a00]">₦{selectedCreator.balance?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col justify-center">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Trust Level</p>
                   <div className="flex items-center gap-2">
                      <ShieldCheck className={`h-5 w-5 ${selectedCreator.isVerified ? 'text-[#108a00]' : 'text-gray-300'}`} />
                      <p className="text-xs font-bold uppercase tracking-tight">{selectedCreator.isVerified ? 'Verified Pro' : 'Unverified'}</p>
                   </div>
                </div>
              </div>

              <div className="bg-[#001e00] text-white p-6 rounded-[1.5rem] shadow-xl shadow-green-900/10">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Payout Account Information</p>
                 {selectedCreator.bankDetails ? (
                   <div className="space-y-3">
                     <p className="text-sm font-bold tracking-tight text-white/90">{selectedCreator.bankDetails.bankName}</p>
                     <p className="text-xl font-mono text-[#22c55e] font-bold">{selectedCreator.bankDetails.accountNumber}</p>
                     <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{selectedCreator.bankDetails.accountName}</p>
                   </div>
                 ) : (
                   <p className="text-xs italic text-gray-500">No settlement bank linked to this node.</p>
                 )}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => toggleVerification(selectedCreator.id, selectedCreator.isVerified)}
                  className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all ${selectedCreator.isVerified ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-[#108a00] text-white hover:bg-[#0d7000]'}`}
                >
                  {selectedCreator.isVerified ? 'Revoke Badge' : 'Verify Account'}
                </button>
                <button 
                  onClick={() => {
                    toggleBanStatus(selectedCreator.id, selectedCreator.isBanned);
                    setSelectedCreator(null);
                  }}
                  className={`px-6 py-4 rounded-xl font-bold text-sm border transition-all ${selectedCreator.isBanned ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}
                >
                  {selectedCreator.isBanned ? 'Unban' : 'Ban'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}