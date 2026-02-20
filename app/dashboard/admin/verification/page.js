"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { CheckCircle, XCircle, User, Business, Sparkles, ShieldCheck, Search, Star, Tag } from "lucide-react";

export default function VerificationManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const niches = ["Lifestyle", "Tech", "Fashion", "Beauty", "Fitness", "Gaming", "Food"];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const allUsers = [];
      const collections = ["users", "creators", "businesses"];

      for (const colName of collections) {
        const snap = await getDocs(collection(db, colName));
        snap.forEach((doc) => {
          allUsers.push({
            id: doc.id,
            collection: colName,
            ...doc.data(),
          });
        });
      }
      setUsers(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleVerify = async (userId, collectionName) => {
    try {
      const userRef = doc(db, collectionName, userId);
      await updateDoc(userRef, {
        emailVerified: true,
      });
      
      setUsers(users.map(u => 
        (u.id === userId && u.collection === collectionName) 
        ? { ...u, emailVerified: true } 
        : u
      ));
      
      alert("User verified successfully!");
    } catch (error) {
      alert("Error verifying user.");
    }
  };

  const togglePriority = async (userId, currentStatus) => {
    try {
      const creatorRef = doc(db, "creators", userId);
      await updateDoc(creatorRef, {
        isPriority: !currentStatus
      });

      setUsers(users.map(u => 
        (u.id === userId && u.collection === "creators") 
        ? { ...u, isPriority: !currentStatus } 
        : u
      ));

      alert(currentStatus ? "Removed from Featured" : "Added to Featured!");
    } catch (error) {
      console.error("Error updating priority:", error);
      alert("Failed to update priority status.");
    }
  };

  const updateNiche = async (userId, newNiche) => {
    try {
      const creatorRef = doc(db, "creators", userId);
      await updateDoc(creatorRef, {
        niche: newNiche
      });

      setUsers(users.map(u => 
        (u.id === userId && u.collection === "creators") 
        ? { ...u, niche: newNiche } 
        : u
      ));
    } catch (error) {
      console.error("Error updating niche:", error);
      alert("Failed to update niche.");
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#fcfcfc] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase">
              Security <span className="text-[#22c55e]">Clearance.</span>
            </h1>
            <p className="text-sm text-gray-500 font-medium">Manually authorize institutional access and classify talent.</p>
          </div>
          <div className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#22c55e]" /> Admin Portal
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by identity (email)..."
            className="w-full bg-white border-2 border-gray-100 p-4 pl-12 rounded-2xl outline-none focus:border-[#22c55e] transition-all text-sm font-medium"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">User Identity</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Classification</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Niche Assignment</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Auth Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-sm font-bold text-gray-400 animate-pulse uppercase tracking-[0.2em]">
                    Scanning Database...
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={`${user.collection}-${user.id}`} className="hover:bg-gray-50/30 transition-colors">
                  <td className="p-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-gray-900">{user.email || "Unknown Identity"}</span>
                        {user.isPriority && <Star className="h-3 w-3 text-[#22c55e] fill-[#22c55e]" />}
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase">{user.id}</span>
                    </div>
                  </td>
                  <td className="p-6 text-[10px] font-black uppercase">
                    <span className={`px-3 py-1 rounded-full ${
                      user.collection === 'creators' ? 'bg-purple-50 text-purple-600' : 
                      user.collection === 'businesses' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.collection}
                    </span>
                  </td>
                  
                  {/* NICHE DROPDOWN: Only for Creators */}
                  <td className="p-6">
                    {user.collection === 'creators' ? (
                      <div className="relative group">
                        <select 
                          value={user.niche || ""}
                          onChange={(e) => updateNiche(user.id, e.target.value)}
                          className="appearance-none bg-gray-50 border border-gray-100 text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-lg focus:ring-[#22c55e] focus:border-[#22c55e] block w-full p-2.5 outline-none cursor-pointer group-hover:bg-white transition-all"
                        >
                          <option value="" disabled>Select Niche</option>
                          {niches.map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                        <Tag className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                      </div>
                    ) : (
                      <span className="text-[9px] font-black text-gray-200 uppercase italic">N/A</span>
                    )}
                  </td>

                  <td className="p-6">
                    {user.emailVerified ? (
                      <div className="flex items-center gap-1.5 text-[#22c55e] text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle className="h-4 w-4" /> Verified
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-black uppercase tracking-widest">
                        <XCircle className="h-4 w-4" /> Pending
                      </div>
                    )}
                  </td>
                  
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.collection === 'creators' && (
                        <button 
                          onClick={() => togglePriority(user.id, user.isPriority)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all flex items-center gap-1 ${
                            user.isPriority 
                            ? 'bg-[#22c55e] text-white shadow-lg shadow-[#22c55e]/20' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          <Sparkles className={`h-3 w-3 ${user.isPriority ? 'text-white' : 'text-gray-400'}`} />
                          {user.isPriority ? "Featured" : "Promote"}
                        </button>
                      )}

                      {!user.emailVerified && (
                        <button 
                          onClick={() => handleVerify(user.id, user.collection)}
                          className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-[#22c55e] transition-all active:scale-95"
                        >
                          Authorize
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}