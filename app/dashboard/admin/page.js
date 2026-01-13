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
  orderBy
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

export default function AdminMasterDashboard() {
  const router = useRouter();
  const [creators, setCreators] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [notifications, setNotifications] = useState([]); // ✅ Added for Manage Notifications
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("creators"); 
  
  const [selectedCampaign, setSelectedCampaign] = useState(null);

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

        // 1. Fetch Static Data
        const [creatorSnap, businessSnap, campaignSnap] = await Promise.all([
          getDocs(collection(db, "creators")),
          getDocs(collection(db, "businesses")),
          getDocs(collection(db, "campaigns"))
        ]);

        const creatorList = creatorSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCreators(creatorList);
        setBusinesses(businessSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setCampaigns(campaignSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // 2. Real-time Payouts
        const payoutQuery = query(
          collection(db, "transactions"),
          where("type", "==", "withdrawal_pending"),
          where("status", "==", "pending")
        );

        const unsubPayouts = onSnapshot(payoutQuery, (snap) => {
          const rawPayouts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          const enrichedPayouts = rawPayouts.map(p => {
            const creatorInfo = creatorList.find(c => c.id === p.creatorId);
            return { ...p, bankDetails: creatorInfo?.bankDetails || null };
          });
          setPayouts(enrichedPayouts);
        });

        // 3. ✅ REAL-TIME NOTIFICATIONS LISTENER
        const notifQuery = query(
          collection(db, "global_notifications"),
          orderBy("createdAt", "desc")
        );
        const unsubNotifs = onSnapshot(notifQuery, (snap) => {
          setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        setLoading(false);
        return () => {
          unsubPayouts();
          unsubNotifs();
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

  // ✅ Toggle Notification Status
  const toggleNotifStatus = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, "global_notifications", id), { active: !currentStatus });
    } catch (err) {
      alert("Error updating notification.");
    }
  };

  // ✅ Delete Notification
  const deleteNotification = async (id) => {
    if (!confirm("Permanently delete this broadcast?")) return;
    try {
      await deleteDoc(doc(db, "global_notifications", id));
    } catch (err) {
      alert("Error deleting.");
    }
  };

  const toggleBanStatus = async (collectionName, userId, currentStatus) => {
    const newStatus = !currentStatus;
    if (!confirm(`Are you sure?`)) return;
    try {
      await updateDoc(doc(db, collectionName, userId), { isBanned: newStatus });
      const setter = collectionName === "creators" ? setCreators : setBusinesses;
      setter(prev => prev.map(u => u.id === userId ? { ...u, isBanned: newStatus } : u));
    } catch (err) { alert("Error updating ban status."); }
  };

  const toggleVerification = async (userId, currentStatus) => {
    try {
      await updateDoc(doc(db, "creators", userId), { isVerified: !currentStatus });
      setCreators(prev => prev.map(u => u.id === userId ? { ...u, isVerified: !currentStatus } : u));
    } catch (err) { alert("Error updating verification."); }
  };

  const deleteCampaign = async (id) => {
    if (!confirm("Delete this campaign permanently?")) return;
    try {
      await deleteDoc(doc(db, "campaigns", id));
      setCampaigns(prev => prev.filter(c => c.id !== id));
      setSelectedCampaign(null);
    } catch (err) { alert("Error."); }
  };

  const approvePayout = async (payout) => {
    if (!confirm(`Confirm payment of ₦${payout.amount.toLocaleString()} to ${payout.creatorName}?`)) return;
    try {
      await updateDoc(doc(db, "transactions", payout.id), { status: "completed" });
      const creatorRef = doc(db, "creators", payout.creatorId);
      await updateDoc(creatorRef, { balance: increment(-payout.amount) });
      alert("Payout successful.");
    } catch (err) { alert("Error."); }
  };

  // UPDATED BROADCAST FUNCTION
  const sendBroadcast = async (e) => {
    // Prevent form submission if this is inside a form
    if (e && e.preventDefault) e.preventDefault();
    
    if (!broadcastMessage.trim()) return alert("Please enter a message.");
    
    setIsSending(true);
    try {
      // ✅ Use a direct reference to avoid any path issues
      const notifRef = collection(db, "global_notifications");
      
      await addDoc(notifRef, {
        message: broadcastMessage.trim(),
        target: broadcastTarget, 
        createdAt: serverTimestamp(),
        active: true
      });

      setBroadcastMessage("");
      alert(`Broadcast successfully pushed to ${broadcastTarget}!`);
    } catch (err) {
      console.error("Full Error Object:", err);
      // This will tell us if it's a Permission or Index error
      alert(`Error sending broadcast: ${err.message}`);
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
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 font-sans relative">
      
      {/* CAMPAIGN MODAL */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#111] border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-2xl font-black">{selectedCampaign.title}</h2>
              <button onClick={() => setSelectedCampaign(null)} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10">✕</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Business</p>
                  <p className="font-bold text-white">{getBusinessName(selectedCampaign.businessId)}</p>
                </div>
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Assigned Creator</p>
                  <p className="font-bold text-[#a3dcf3]">{selectedCampaign.assignedCreatorId ? getCreatorName(selectedCampaign.assignedCreatorId) : "Unassigned"}</p>
                </div>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-xl font-black text-green-500">₦{selectedCampaign.budget?.toLocaleString()}</p>
                <button onClick={() => deleteCampaign(selectedCampaign.id)} className="bg-red-500/10 text-red-500 px-6 py-2 rounded-lg font-black text-[10px] uppercase">Purge</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black tracking-tighter italic">ADMIN <span className="text-[#a3dcf3] not-italic text-5xl">CORE</span></h1>
        <button onClick={() => signOut(auth)} className="bg-white/5 text-gray-400 px-6 py-3 rounded-2xl font-black border border-white/10 text-[10px] uppercase">Logoff</button>
      </header>

      {/* GLOBAL BROADCAST SYSTEM */}
      <div className="bg-white/5 p-8 rounded-[2.5rem] border border-[#a3dcf3]/20 mb-12 shadow-2xl">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a3dcf3] mb-4">Emergency Broadcast System</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text"
            placeholder="Important announcement for all users..."
            className="flex-1 bg-black/40 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#a3dcf3] font-bold text-sm"
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
          />
          <select 
            className="bg-black/40 border border-white/10 p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest outline-none"
            value={broadcastTarget}
            onChange={(e) => setBroadcastTarget(e.target.value)}
          >
            <option value="all">Everyone</option>
            <option value="creators">Creators Only</option>
            <option value="businesses">Businesses Only</option>
          </select>
          <button 
            onClick={sendBroadcast}
            disabled={isSending}
            className="bg-[#a3dcf3] text-black px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all disabled:opacity-50"
          >
            {isSending ? "Sending..." : "Push Alert"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/5 p-1 rounded-2xl w-fit mb-8 border border-white/5">
        {["creators", "businesses", "campaigns", "payouts", "notifications"].map((tab) => (
          <button 
            key={tab}
            onClick={() => setView(tab)}
            className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${view === tab ? 'bg-[#a3dcf3] text-black' : 'text-gray-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Table Content */}
      <div className="bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/5 bg-white/[0.02]">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                  {view === "notifications" ? "Message Content" : "Identity"}
                </th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                  {view === "notifications" ? "Target & Status" : "Financial/Status"}
                </th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-500 text-right tracking-widest">Execute</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {/* ✅ NOTIFICATIONS VIEW */}
              {view === "notifications" ? (
                notifications.map((n) => (
                  <tr key={n.id} className="hover:bg-white/[0.01]">
                    <td className="p-6">
                      <p className="font-bold text-gray-200 text-sm max-w-md italic">"{n.message}"</p>
                      <p className="text-[9px] text-gray-600 mt-1 uppercase font-black">{n.createdAt?.toDate().toLocaleDateString()}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-2">
                        <span className={`text-[10px] font-black uppercase w-fit px-2 py-1 rounded-md ${
                          n.target === 'all' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          Target: {n.target}
                        </span>
                        <span className={`text-[10px] font-black uppercase w-fit px-2 py-1 rounded-md ${
                          n.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {n.active ? '● Live' : '○ Disabled'}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => toggleNotifStatus(n.id, n.active)}
                          className="text-[9px] font-black uppercase bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10"
                        >
                          {n.active ? "Deactivate" : "Activate"}
                        </button>
                        <button 
                          onClick={() => deleteNotification(n.id)}
                          className="text-[9px] font-black uppercase bg-red-500/10 text-red-500 px-4 py-2 rounded-lg border border-red-500/20 hover:bg-red-500/20"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : view === "payouts" ? (
                payouts.map((p) => (
                  <tr key={p.id}>
                    <td className="p-6">
                      <p className="font-bold text-gray-200">{p.creatorName}</p>
                      {p.bankDetails && (
                        <div className="mt-2 text-[10px] text-gray-500 font-mono">
                          {p.bankDetails.bankName} - {p.bankDetails.accountNumber}
                        </div>
                      )}
                    </td>
                    <td className="p-6"><p className="text-2xl font-black text-orange-500">₦{p.amount?.toLocaleString()}</p></td>
                    <td className="p-6 text-right">
                      <button onClick={() => approvePayout(p)} className="text-[10px] font-black uppercase bg-green-500 text-black px-6 py-3 rounded-xl">Paid</button>
                    </td>
                  </tr>
                ))
              ) : view === "campaigns" ? (
                campaigns.map((c) => (
                  <tr key={c.id}>
                    <td className="p-6"><p className="font-bold text-gray-200">{c.title}</p></td>
                    <td className="p-6"><span className="text-[#a3dcf3] font-black">₦{c.budget?.toLocaleString()}</span></td>
                    <td className="p-6 text-right">
                      <button onClick={() => setSelectedCampaign(c)} className="text-[10px] font-black uppercase bg-[#a3dcf3] text-black px-4 py-2 rounded-lg">Inspect</button>
                    </td>
                  </tr>
                ))
              ) : (
                (view === "creators" ? creators : businesses).map((user) => (
                  <tr key={user.id}>
                    <td className="p-6">
                      <p className="font-bold text-gray-200">{user.name || user.companyName}</p>
                    </td>
                    <td className="p-6">
                      {user.isVerified && <span className="text-[9px] font-black text-blue-500 mr-2 uppercase">Verified</span>}
                      {user.isBanned && <span className="text-[9px] font-black text-red-500 uppercase">Banned</span>}
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        {view === "creators" && (
                          <button onClick={() => toggleVerification(user.id, user.isVerified)} className="text-[9px] font-black uppercase border border-white/10 px-3 py-2 rounded-lg">Verify</button>
                        )}
                        <button onClick={() => toggleBanStatus(view === "creators" ? "creators" : "businesses", user.id, user.isBanned)} className="text-[9px] font-black uppercase border border-red-500/20 text-red-500 px-3 py-2 rounded-lg">Ban</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}