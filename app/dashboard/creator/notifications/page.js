"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  doc, 
  getDoc,
  updateDoc,
  writeBatch
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

import CreatorNavbar from "@/app/components/CreatorNavbar";
import { 
  Bell, 
  Clock, 
  CheckCheck, 
  ArrowLeft, 
  Loader2,
  Inbox,
  ExternalLink,
  Circle
} from "lucide-react";

export default function CreatorNotificationsPage() {
  const router = useRouter();
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push("/login");

      // Fetch Profile for Navbar
      const profileSnap = await getDoc(doc(db, "creators", user.uid));
      if (profileSnap.exists()) setCreatorProfile(profileSnap.data());

      // Fetch All Notifications
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const unsubscribeNotifs = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          setNotifications([]);
          setLoading(false);
          return;
        }

        const notifData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setNotifications(notifData);
        setLoading(false);
      }, (err) => {
        console.error("Error fetching notifications:", err);
        setLoading(false);
      });

      return () => unsubscribeNotifs();
    });

    return () => unsubscribeAuth();
  }, [router]);

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;

    const batch = writeBatch(db);
    unread.forEach((notif) => {
      const ref = doc(db, "notifications", notif.id);
      batch.update(ref, { read: true });
    });

    try {
      await batch.commit();
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.read) {
      await updateDoc(doc(db, "notifications", notif.id), { read: true });
    }
    if (notif.link) router.push(notif.link);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="h-10 w-10 animate-spin text-[#22c55e]" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-4">Retrieving Activity...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#001E00] antialiased">
      <CreatorNavbar 
        creatorName={creatorProfile?.name} 
        balance={creatorProfile?.balance || 0} 
      />

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Return
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                Notifications Center<span className="text-[#22c55e]">.</span>
              </h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">
                Stay updated on bids, payments, and brand messages
              </p>
            </div>

            {notifications.some(n => !n.read) && (
              <button 
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-black hover:text-white transition-all rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-100"
              >
                <CheckCheck className="h-4 w-4" /> Mark all as read
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className={`group relative bg-white border rounded-[2rem] p-6 flex items-start gap-6 transition-all cursor-pointer ${
                  !notif.read 
                    ? "border-[#22c55e]/30 bg-[#22c55e]/[0.02] shadow-lg shadow-[#22c55e]/5" 
                    : "border-gray-100 hover:border-gray-300"
                }`}
              >
                {/* Indicator Dot */}
                {!notif.read && (
                    <Circle className="absolute top-8 right-8 h-2 w-2 fill-[#22c55e] text-[#22c55e] animate-pulse" />
                )}

                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all ${
                  !notif.read 
                    ? "bg-[#22c55e] border-[#22c55e] text-black" 
                    : "bg-gray-50 border-gray-100 text-gray-300"
                }`}>
                  <Bell className="h-6 w-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${!notif.read ? 'text-[#22c55e]' : 'text-gray-400'}`}>
                      {notif.type || 'System Update'}
                    </span>
                    <span className="h-1 w-1 bg-gray-200 rounded-full"></span>
                    <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Clock className="h-3 w-3" />
                      {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                    </div>
                  </div>
                  
                  <p className={`text-lg leading-snug tracking-tight mb-4 ${!notif.read ? 'font-black text-gray-900' : 'font-medium text-gray-500'}`}>
                    {notif.message}
                  </p>

                  {notif.link && (
                    <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#22c55e] group-hover:gap-3 transition-all">
                      View details <ExternalLink className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] py-32 text-center">
              <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Inbox className="h-10 w-10 text-gray-200" />
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-400">Your inbox is empty</h3>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-2">
                We'll notify you here when there's news about your applications.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}