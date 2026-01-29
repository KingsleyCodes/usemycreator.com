"use client";

import { useState } from "react";
import { useAdminData } from "../useAdminData";
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Filter,
  Download,
  Calendar,
  CreditCard,
  History
} from "lucide-react";

export default function TransactionsAdminPage() {
  const { transactions, loading } = useAdminData();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all, deposit, withdrawal, escrow

  // Logic to filter the ledger
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.creatorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center text-[#108a00] font-black uppercase text-[10px] tracking-widest animate-pulse">
      Syncing Global Ledger...
    </div>
  );

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500">
      
      {/* HEADER & ANALYTICS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-[#001e00]">
            Global <span className="text-[#108a00]">Ledger.</span>
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Audit trail of all platform movements</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search IDs or names..."
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm w-full md:w-64 outline-none focus:border-[#108a00] transition-all shadow-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider outline-none focus:border-[#108a00] shadow-sm cursor-pointer"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="escrow">Escrow Locks</option>
          </select>
        </div>
      </div>

      {/* TRANSACTION TABLE */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Timestamp / ID</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Entity</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Event Type</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="group hover:bg-gray-50/80 transition-all cursor-default">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                       <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${tx.type === 'withdrawal' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-[#108a00]'}`}>
                          {tx.type === 'withdrawal' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                       </div>
                       <div>
                          <p className="text-[11px] font-black text-black uppercase tracking-tight">
                            {tx.createdAt?.seconds ? new Date(tx.createdAt.seconds * 1000).toLocaleString() : 'Processing...'}
                          </p>
                          <p className="text-[9px] font-mono text-gray-400">TXN-{tx.id.slice(0, 8).toUpperCase()}</p>
                       </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-bold text-gray-700 uppercase">{tx.businessName || tx.creatorName || 'System Event'}</p>
                    <p className="text-[9px] text-gray-400 font-medium uppercase tracking-tighter">{tx.email || 'Automated'}</p>
                  </td>
                  <td className="p-6">
                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${
                      tx.type === 'withdrawal' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                      tx.type === 'deposit' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                      'bg-purple-50 text-purple-600 border-purple-100'
                    }`}>
                      {tx.type || 'Transaction'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <p className={`text-sm font-black tracking-tighter ${tx.type === 'withdrawal' ? 'text-red-500' : 'text-[#108a00]'}`}>
                      {tx.type === 'withdrawal' ? '-' : '+'} ₦{tx.amount?.toLocaleString()}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTransactions.length === 0 && (
            <div className="p-24 text-center">
              <History className="h-10 w-10 text-gray-100 mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">No matching entries found in the ledger</p>
            </div>
          )}
        </div>
      </div>

      {/* SUMMARY BAR */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black text-white p-6 rounded-[2rem] shadow-xl">
             <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 text-center">Platform Volume</p>
             <p className="text-2xl font-black text-center tracking-tighter italic">₦{transactions.reduce((acc, t) => acc + (t.amount || 0), 0).toLocaleString()}</p>
          </div>
      </div>
    </div>
  );
}