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
  X
} from "lucide-react";

export default function NotificationsAdminPage() {
  const { notifications, loading } = useAdminData();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info"); // info, success, warning
  const [isSending, setIsSending] = useState(false);

  // --- ACTIONS RETAINED FROM YOUR ORIGINAL DASHBOARD ---
  const sendBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !message) return alert("Please fill in all fields.");
    if (!confirm("This will send a notification to EVERY user on the platform. Proceed?")) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, "global_notifications"), {
        title,
        message,
        type,
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
    <div className="h-[60vh] flex items-center justify-center text-[#108a00] font-black uppercase text-[10px] tracking-widest animate-pulse">
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
              Broadcast <span className="text-[#108a00]">Center.</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-8">Deploy platform-wide alerts</p>

            <form onSubmit={sendBroadcast} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50">
              <div className="space-y-6">
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
                    className="w-full bg-gray-50 border border-transparent focus:border-[#108a00] focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">Message Body</label>
                  <textarea 
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe the update or announcement..."
                    className="w-full bg-gray-50 border border-transparent focus:border-[#108a00] focus:bg-white rounded-2xl px-5 py-4 text-sm font-medium outline-none transition-all resize-none"
                  />
                </div>

                <button 
                  disabled={isSending}
                  className="w-full bg-[#108a00] text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#0d7000] disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-900/20"
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
            <History className="h-5 w-5 text-[#108a00]" />
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
                <div key={n.id} className="group bg-white border border-gray-100 rounded-[2rem] p-6 hover:border-[#108a00] transition-all relative overflow-hidden">
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex gap-5">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        n.type === 'warning' ? 'bg-amber-50 text-amber-500' : 
                        n.type === 'success' ? 'bg-green-50 text-[#108a00]' : 
                        'bg-blue-50 text-blue-500'
                      }`}>
                        {n.type === 'warning' ? <AlertTriangle className="h-5 w-5" /> : 
                         n.type === 'success' ? <CheckCircle className="h-5 w-5" /> : 
                         <Info className="h-5 w-5" />}
                      </div>
                      <div>
                        <h4 className="font-black text-black uppercase italic tracking-tight text-lg">{n.title}</h4>
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