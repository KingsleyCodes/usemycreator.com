"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  increment,
  addDoc,
  serverTimestamp,
  orderBy,
  runTransaction
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

import { 
  ExternalLink, 
  ShieldCheck, 
  Ban, 
  User as UserIcon, 
  Activity, 
  CreditCard, 
  TrendingUp, 
  Lock,
  ArrowUpRight,
  Search,
  CheckCircle,
  Banknote,
  Clock,
  AlertCircle,
  Building2,
  X,
  ShieldAlert
} from "lucide-react";

export default function AdminMasterDashboard() {
  const router = useRouter();
  const [creators, setCreators] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [transactions, setTransactions] = useState([]); 
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("creators"); 
  
  // MODAL STATES
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedCreator, setSelectedCreator] = useState(null);

  // Broadcast States
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("all"); 
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const adminDocRef = doc(db, "admins", user.uid);
        const adminDocSnap = await getDoc(adminDocRef);
        
        if (!adminDocSnap.exists()) {
          await signOut(auth); 
          router.push("/login");
          return;
        }

        // 1. REAL-TIME DATA LISTENERS
        const unsubCreators = onSnapshot(collection(db, "creators"), (snap) => {
            setCreators(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const unsubBiz = onSnapshot(collection(db, "businesses"), (snap) => {
            setBusinesses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const unsubCamps = onSnapshot(collection(db, "campaigns"), (snap) => {
            setCampaigns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const withdrawalQuery = query(collection(db, "withdrawals"), orderBy("createdAt", "desc"));
        const unsubWithdrawals = onSnapshot(withdrawalQuery, (snap) => {
          setPayouts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const transQuery = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
        const unsubTrans = onSnapshot(transQuery, (snap) => {
          setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const notifQuery = query(collection(db, "global_notifications"), orderBy("createdAt", "desc"));
        const unsubNotifs = onSnapshot(notifQuery, (snap) => {
          setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        setLoading(false);
        return () => {
          unsubCreators();
          unsubBiz();
          unsubCamps();
          unsubWithdrawals();
          unsubNotifs();
          unsubTrans();
        };

      } catch (err) {
        console.error("Security Error:", err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const getBusinessName = (id) => businesses.find(b => b.id === id)?.companyName || "Unknown Business";
  const getCreatorName = (id) => creators.find(c => c.id === id)?.name || "Not Assigned Yet";

  // --- UPDATED WITHDRAWAL APPROVAL LOGIC ---
  const approvePayout = async (request) => {
    const confirmation = window.confirm(
      `PAYOUT AUTHORIZATION:\n\n` +
      `Amount: ₦${request.amount.toLocaleString()}\n` +
      `Bank: ${request.bankName}\n` +
      `Account: ${request.accountNumber}\n` +
      `Name: ${request.accountName}\n\n` +
      `Confirm you have manually processed this transfer?`
    );

    if (!confirmation) return;

    try {
      await runTransaction(db, async (transaction) => {
        const withdrawalRef = doc(db, "withdrawals", request.id);
        
        // 1. Mark Withdrawal as processed
        transaction.update(withdrawalRef, {
          status: "completed",
          processedAt: serverTimestamp(),
          adminReference: `ADM-${auth.currentUser.uid.slice(0,5)}`
        });

        // 2. Log final success transaction for Creator history
        const newTransRef = doc(collection(db, "transactions"));
        transaction.set(newTransRef, {
          creatorId: request.creatorId,
          amount: request.amount,
          type: "payout_settlement",
          status: "success",
          createdAt: serverTimestamp(),
          reference: `WIT-${request.id.slice(0, 8)}`,
          bankUsed: request.bankName,
          accountUsed: request.accountNumber
        });
      });

      alert("Payout marked as COMPLETED. Creator ledger updated.");
    } catch (err) {
      console.error(err);
      alert("Error approving payout.");
    }
  };

  const releaseFunds = async (campaign) => {
    if (!confirm(`ADMIN OVERRIDE: Are you sure you want to release ₦${campaign.budget.toLocaleString()} to ${getCreatorName(campaign.assignedCreatorId)}?`)) return;

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
        alert(data.error);
      }
    } catch (err) {
      alert("Release failed.");
    }
  };

  const deleteNotification = async (id) => {
    if (!confirm("Permanently delete this broadcast?")) return;
    try {
      await deleteDoc(doc(db, "global_notifications", id));
    } catch (err) {
      alert("Error deleting.");
    }
  };

  const toggleBanStatus = async (collectionName, userId, currentStatus) => {
    if (!confirm(`Are you sure you want to change ban status?`)) return;
    try {
      await updateDoc(doc(db, collectionName, userId), { isBanned: !currentStatus });
    } catch (err) { alert("Error updating ban status."); }
  };

  const toggleVerification = async (userId, currentStatus) => {
    try {
      await updateDoc(doc(db, "creators", userId), { isVerified: !currentStatus });
    } catch (err) { alert("Error."); }
  };

  const deleteCampaign = async (id) => {
    if (!confirm("Delete this campaign permanently?")) return;
    try {
      await deleteDoc(doc(db, "campaigns", id));
      setSelectedCampaign(null);
    } catch (err) { alert("Error."); }
  };

  const sendBroadcast = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!broadcastMessage.trim()) return alert("Please enter a message.");
    
    setIsSending(true);
    try {
      await addDoc(collection(db, "global_notifications"), {
        message: broadcastMessage.trim(),
        target: broadcastTarget, 
        createdAt: serverTimestamp(),
        active: true
      });
      setBroadcastMessage("");
      alert(`Broadcast pushed!`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black text-[#a3dcf3] font-black tracking-[0.3em] animate-pulse uppercase text-xs">
      Initialising Admin Core...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 font-sans relative selection:bg-[#a3dcf3] selection:text-black">
      
      {/* CREATOR INSPECTOR MODAL */}
      {selectedCreator && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-[#111] border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h2 className="text-xl font-black uppercase tracking-tighter italic">Creator <span className="text-[#a3dcf3]">File.</span></h2>
              <button onClick={() => setSelectedCreator(null)} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                <div className="h-16 w-16 rounded-xl bg-[#a3dcf3]/20 flex items-center justify-center font-black text-2xl text-[#a3dcf3] italic uppercase">
                  {selectedCreator.name?.[0]}
                </div>
                <div>
                  <p className="font-black text-lg">{selectedCreator.name}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{selectedCreator.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-center">
                   <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Liquid Balance</p>
                   <p className="text-xl font-black text-emerald-500">₦{selectedCreator.balance?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center">
                   <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Status</p>
                   <div className="flex items-center gap-1">
                      {selectedCreator.isVerified && <ShieldCheck className="h-3 w-3 text-[#a3dcf3]" />}
                      <p className={`text-[10px] font-black uppercase ${selectedCreator.isVerified ? 'text-[#a3dcf3]' : 'text-gray-500'}`}>
                          {selectedCreator.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                      </p>
                   </div>
                </div>
              </div>

              {/* SETTLEMENT DETAILS */}
              <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5">
                 <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Building2 className="h-3 w-3" /> Settlement Destination
                    </p>
                    {selectedCreator.bankDetails && (
                        <span className="text-[8px] font-black text-[#a3dcf3] border border-[#a3dcf3]/20 px-2 py-0.5 rounded italic">PAYSTACK VERIFIED</span>
                    )}
                 </div>

                 {selectedCreator.bankDetails ? (
                   <div className="space-y-3">
                     <div className="flex justify-between border-b border-white/5 pb-2">
                       <span className="text-[10px] font-bold text-gray-600 uppercase">Bank</span>
                       <span className="text-xs font-black">{selectedCreator.bankDetails.bankName}</span>
                     </div>
                     <div className="flex justify-between border-b border-white/5 pb-2">
                       <span className="text-[10px] font-bold text-gray-600 uppercase">Account Number</span>
                       <span className="text-xs font-mono font-bold tracking-wider text-[#a3dcf3]">{selectedCreator.bankDetails.accountNumber}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-[10px] font-bold text-gray-600 uppercase">Account Name</span>
                       <span className="text-xs font-black text-gray-400 uppercase tracking-tight">{selectedCreator.bankDetails.accountName}</span>
                     </div>
                   </div>
                 ) : (
                   <div className="py-4 text-center">
                     <p className="text-[10px] font-black text-red-500/50 uppercase italic tracking-widest">No settlement details on file</p>
                   </div>
                 )}
              </div>

              <button 
                 onClick={() => setSelectedCreator(null)}
                 className="w-full bg-white/5 text-gray-400 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CAMPAIGN MODAL */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#111] border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">{selectedCampaign.title}</h2>
              <button onClick={() => setSelectedCampaign(null)} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">✕</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black text-gray-500 uppercase mb-1 tracking-widest">Client Business</p>
                  <p className="font-bold text-white uppercase text-sm">{getBusinessName(selectedCampaign.businessId)}</p>
                </div>
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black text-gray-500 uppercase mb-1 tracking-widest">Assigned Talent</p>
                  <p className="font-bold text-[#a3dcf3] uppercase text-sm">{selectedCampaign.assignedCreatorId ? getCreatorName(selectedCampaign.assignedCreatorId) : "Unassigned"}</p>
                </div>
              </div>

              <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="flex flex-col">
                    <p className="text-[9px] font-black text-gray-500 uppercase mb-1 tracking-widest">Escrow Registry</p>
                    <p className={`text-sm font-black uppercase ${selectedCampaign.paymentStatus === 'escrow_locked' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {selectedCampaign.paymentStatus || 'UNPAID'}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-gray-500 uppercase mb-1 tracking-widest">Authorized Budget</p>
                    <p className="text-2xl font-black text-white italic">₦{selectedCampaign.budget?.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {selectedCampaign.paymentStatus === 'escrow_locked' && selectedCampaign.assignedCreatorId && (
                    <button 
                        onClick={() => releaseFunds(selectedCampaign)}
                        className="flex-1 bg-emerald-500 text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        <CheckCircle className="h-4 w-4" /> Release Funds to Creator
                    </button>
                )}
                <button 
                    onClick={() => deleteCampaign(selectedCampaign.id)} 
                    className="bg-red-500/10 text-red-500 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-500/20 hover:bg-red-500/20 transition-all"
                >
                    Purge Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black tracking-tighter italic">ADMIN <span className="text-[#a3dcf3] not-italic text-5xl">CORE</span></h1>
        <button onClick={() => signOut(auth)} className="bg-white/5 text-gray-400 px-6 py-3 rounded-2xl font-black border border-white/10 text-[10px] uppercase hover:bg-white/10 transition-all">Logoff</button>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem] hover:bg-white/[0.07] transition-all">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Total Platform Volume</p>
            <h4 className="text-3xl font-black text-[#a3dcf3]">₦{transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}</h4>
        </div>
        <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem] hover:bg-white/[0.07] transition-all">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Queue: Pending Payouts</p>
            <h4 className="text-3xl font-black text-orange-500">₦{payouts.filter(p => p.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</h4>
        </div>
        <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem] hover:bg-white/[0.07] transition-all">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Aggregated Network</p>
            <h4 className="text-3xl font-black text-white">{creators.length + businesses.length} Users</h4>
        </div>
      </div>

      {/* Tabs Nav */}
      <div className="flex flex-wrap bg-white/5 p-1 rounded-2xl w-fit mb-8 border border-white/5">
        {["creators", "businesses", "campaigns", "transactions", "payouts", "notifications"].map((tab) => (
          <button 
            key={tab}
            onClick={() => setView(tab)}
            className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${view === tab ? 'bg-[#a3dcf3] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Data Engine */}
      <div className="bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/5 bg-white/[0.02]">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                  {view === "notifications" ? "Broadcast Transmission" : "Entity Identification"}
                </th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                  {view === "payouts" ? "Verification & Destination" : "Status & Metrics"}
                </th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-500 text-right tracking-widest">Administrative Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              
              {/* PAYOUTS VIEW */}
              {view === "payouts" ? (
                payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-6">
                      <p className="font-bold text-gray-200 uppercase text-xs">{p.creatorName}</p>
                      <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-1">
                        TXN: {new Date(p.createdAt?.seconds * 1000).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <p className="text-lg font-black text-orange-500 italic">₦{p.amount?.toLocaleString()}</p>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-gray-500 uppercase bg-white/5 px-2 py-0.5 rounded italic">VERIFIED</span>
                            <p className="text-[10px] text-gray-400 font-mono tracking-tighter">
                            {p.bankName} • {p.accountNumber}
                            </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      {p.status === "pending" ? (
                        <button 
                          onClick={() => approvePayout(p)} 
                          className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-emerald-400 transition-all shadow-lg active:scale-95"
                        >
                          Complete Transfer
                        </button>
                      ) : (
                        <div className="flex justify-end items-center gap-2 text-gray-500">
                            <CheckCircle className="h-3 w-3" />
                            <span className="text-[10px] font-black uppercase italic tracking-widest">Settled</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : view === "transactions" ? (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.01]">
                    <td className="p-6">
                        <div className="flex items-center gap-3">
                            <Activity className="h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm font-mono font-bold text-gray-300">{t.reference || 'INT_LEDGER'}</p>
                                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{t.createdAt?.toDate().toLocaleString()}</p>
                            </div>
                        </div>
                    </td>
                    <td className="p-6">
                        <p className={`text-lg font-black italic ${t.type.includes('deposit') ? 'text-emerald-500' : 'text-orange-500'}`}>
                          {t.type.includes('deposit') ? '+' : '-'} ₦{t.amount?.toLocaleString()}
                        </p>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{t.type.replace('_', ' ')}</p>
                    </td>
                    <td className="p-6 text-right font-black text-[10px] uppercase text-gray-500 tracking-[0.2em]">{t.status}</td>
                  </tr>
                ))
              ) : view === "campaigns" ? (
                campaigns.map((c) => (
                  <tr key={c.id}>
                    <td className="p-6">
                        <p className="font-bold text-gray-200 uppercase text-xs">{c.title}</p>
                        <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.3em]">{c.platform}</p>
                    </td>
                    <td className="p-6">
                        <span className="text-[#a3dcf3] font-black text-sm italic">₦{c.budget?.toLocaleString()}</span>
                        <p className={`text-[8px] font-black uppercase tracking-widest ${c.paymentStatus === 'escrow_locked' ? 'text-emerald-500' : 'text-amber-500'}`}>{c.paymentStatus || 'UNPAID'}</p>
                    </td>
                    <td className="p-6 text-right">
                      <button onClick={() => setSelectedCampaign(c)} className="text-[10px] font-black uppercase bg-[#a3dcf3] text-black px-6 py-2 rounded-lg hover:scale-105 transition-all">Inspect</button>
                    </td>
                  </tr>
                ))
              ) : view === "notifications" ? (
                notifications.map((n) => (
                  <tr key={n.id}>
                    <td className="p-6">
                      <p className="font-bold text-gray-200 text-sm italic">"{n.message}"</p>
                    </td>
                    <td className="p-6">
                      <span className="text-[10px] font-black uppercase text-purple-400 bg-purple-500/10 px-3 py-1 rounded tracking-widest">@{n.target}</span>
                    </td>
                    <td className="p-6 text-right">
                      <button onClick={() => deleteNotification(n.id)} className="text-red-500 hover:text-red-400 transition-colors bg-red-500/5 p-2 rounded-lg"><X className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))
              ) : (
                (view === "creators" ? creators : businesses).map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.01]">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-gray-600 italic uppercase">
                          {user.name?.[0] || user.companyName?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-200 uppercase text-xs">{user.name || user.companyName}</p>
                          <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex gap-2">
                        {user.isVerified && <span className="text-[8px] font-black text-[#a3dcf3] bg-[#a3dcf3]/10 px-2 py-1 rounded uppercase tracking-widest border border-[#a3dcf3]/20 italic">Verified</span>}
                        {user.isBanned && <span className="text-[8px] font-black text-red-500 bg-red-500/10 px-2 py-1 rounded uppercase tracking-widest border border-red-500/20">Suspended</span>}
                        {!user.isVerified && !user.isBanned && <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Active</span>}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        {view === "creators" && (
                          <>
                            <button 
                                onClick={() => setSelectedCreator(user)} 
                                className="text-[9px] font-black uppercase bg-white/5 text-[#a3dcf3] border border-white/10 px-4 py-2 rounded-lg hover:bg-[#a3dcf3] hover:text-black transition-all"
                            >
                                File
                            </button>
                            <button onClick={() => toggleVerification(user.id, user.isVerified)} className="text-[9px] font-black uppercase border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
                                {user.isVerified ? "Revoke" : "Verify"}
                            </button>
                          </>
                        )}
                        <button onClick={() => toggleBanStatus(view === "creators" ? "creators" : "businesses", user.id, user.isBanned)} className="text-[9px] font-black uppercase border border-red-500/20 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-all">
                          {user.isBanned ? "Lift" : "Ban"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast System */}
      <div className="mt-12 bg-white/5 p-10 rounded-[2.5rem] border border-[#a3dcf3]/20 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="h-4 w-4 text-[#a3dcf3]" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#a3dcf3]">Platform Broadcast Engine</h3>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text"
            placeholder="Type your system announcement..."
            className="flex-1 bg-black/40 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#a3dcf3] font-bold text-sm transition-all"
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
          />
          <select 
            className="bg-black/40 border border-white/10 p-5 rounded-2xl font-black text-[10px] uppercase outline-none cursor-pointer hover:border-white/20 transition-all"
            value={broadcastTarget}
            onChange={(e) => setBroadcastTarget(e.target.value)}
          >
            <option value="all">Global (All Users)</option>
            <option value="creators">Creators Only</option>
            <option value="businesses">Businesses Only</option>
          </select>
          <button 
            onClick={sendBroadcast}
            disabled={isSending}
            className="bg-[#a3dcf3] text-black px-12 py-5 rounded-2xl font-black text-[10px] uppercase hover:scale-105 transition-all disabled:opacity-30 shadow-lg shadow-[#a3dcf3]/10"
          >
            {isSending ? "Transmitting..." : "Push Alert"}
          </button>
        </div>
      </div>
    </div>
  );
}