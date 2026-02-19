"use client";

import { useState } from "react";
import { useAdminData } from "../useAdminData";
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Bell, 
  Send, 
  Trash2, 
  Megaphone, 
  Info, 
  AlertTriangle, 
  CheckCircle,
  History,
  X,
  Users,
  Building2,
  Globe
} from "lucide-react";

export default function NotificationsAdminPage() {
  const { notifications, loading } = useAdminData();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info"); // info, success, warning
  const [target, setTarget] = useState("all"); // all, creators, businesses
  const [isSending, setIsSending] = useState(false);

  // --- ACTIONS RETAINED FROM YOUR ORIGINAL DASHBOARD ---
  const sendBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !message) return alert("Please fill in all fields.");
    
    const targetLabel = target === "all" ? "EVERY user" : target;
    if (!confirm(`This will send a notification to ${targetLabel} on the platform. Proceed?`)) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, "global_notifications"), {
        title,
        message,
        type,
        target, // Save the selected audience
        createdAt: serverTimestamp(),
        active: true
      });
      
      setTitle("");
      setMessage("");
      alert("Broadcast sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send broadcast.");
    } finally {
      setIsSending(false);
    }
  };

  const deleteNotification = async (id) => {
    if (!confirm("Delete this broadcast history?")) return;
    try {
      await deleteDoc(doc(db, "global_notifications", id));
    } catch (err) {
      alert("Error deleting notification.");
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center text-[#22c55e] font-black uppercase text-[10px] tracking-widest animate-pulse">
      Syncing Communication Lines...
    </div>
  );

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500">
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* LEFT: COMPOSER FORM */}
        <div className="xl:col-span-1">
          <div className="sticky top-10">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-[#001e00] mb-2">
              Broadcast <span className="text-[#22c55e]">Center.</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-8">Deploy platform-wide alerts</p>

            <form onSubmit={sendBroadcast} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50">
              <div className="space-y-6">
                
                {/* TARGET AUDIENCE SELECTION (RESTORED FEATURE) */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">Target Audience</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'all', icon: <Globe className="h-3 w-3" />, label: 'All' },
                      { id: 'creators', icon: <Users className="h-3 w-3" />, label: 'Creators' },
                      { id: 'businesses', icon: <Building2 className="h-3 w-3" />, label: 'Brands' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTarget(t.id)}
                        className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex flex-col items-center gap-1 ${
                          target === t.id 
                          ? 'bg-[#22c55e] text-white border-[#22c55e] shadow-lg shadow-[#22c55e]/20' 
                          : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-200'
                        }`}
                      >
                        {t.icon}
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">Alert Priority</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['info', 'success', 'warning'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                          type === t 
                          ? 'bg-black text-white border-black shadow-lg shadow-black/20' 
                          : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">Headline</label>
                  <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. System Maintenance"
                    className="w-full bg-gray-50 border border-transparent focus:border-[#22c55e] focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">Message Body</label>
                  <textarea 
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe the update or announcement..."
                    className="w-full bg-gray-50 border border-transparent focus:border-[#22c55e] focus:bg-white rounded-2xl px-5 py-4 text-sm font-medium outline-none transition-all resize-none"
                  />
                </div>

                <button 
                  disabled={isSending}
                  className="w-full bg-[#22c55e] text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#1ba84d] disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#22c55e]/20"
                >
                  {isSending ? "Deploying..." : (
                    <>
                      <Send className="h-4 w-4" /> Dispatch Broadcast
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT: BROADCAST HISTORY */}
        <div className="xl:col-span-2">
          <div className="flex items-center gap-3 mb-8">
            <History className="h-5 w-5 text-[#22c55e]" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Transmission History</h2>
          </div>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
                <Megaphone className="h-10 w-10 text-gray-100 mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">No previous broadcasts recorded</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="group bg-white border border-gray-100 rounded-[2rem] p-6 hover:border-[#22c55e] transition-all relative overflow-hidden">
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex gap-5">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        n.type === 'warning' ? 'bg-amber-50 text-amber-500' : 
                        n.type === 'success' ? 'bg-green-50 text-[#22c55e]' : 
                        'bg-blue-50 text-blue-500'
                      }`}>
                        {n.type === 'warning' ? <AlertTriangle className="h-5 w-5" /> : 
                         n.type === 'success' ? <CheckCircle className="h-5 w-5" /> : 
                         <Info className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <h4 className="font-black text-black uppercase italic tracking-tight text-lg">{n.title}</h4>
                           <span className="bg-gray-100 text-[8px] px-2 py-0.5 rounded-full font-black text-gray-500 uppercase tracking-widest">
                             Target: {n.target || 'all'}
                           </span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed mt-1 max-w-xl">{n.message}</p>
                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-4">
                          Sent {n.createdAt?.seconds ? new Date(n.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => deleteNotification(n.id)}
                      className="p-2 text-gray-200 hover:text-red-500 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  {/* Decorative faint background icon */}
                  <Bell className="absolute -bottom-4 -right-4 h-24 w-24 text-gray-50 opacity-50 group-hover:text-green-50 transition-colors" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}