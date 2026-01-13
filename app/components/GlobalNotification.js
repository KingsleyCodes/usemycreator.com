"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";

export default function GlobalNotification({ targetType }) {
  const [notification, setNotification] = useState(null);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "global_notifications"),
      where("target", "in", [targetType, "all"]),
      where("active", "==", true),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data();
        const id = snap.docs[0].id;
        
        const dismissedId = localStorage.getItem("dismissed_notif_id");
        if (dismissedId !== id) {
          setNotification({ id, ...data });
          setIsDismissed(false);
          setTimeout(() => setIsVisible(true), 100);
        }
      } else {
        setNotification(null);
      }
    });

    return () => unsubscribe();
  }, [targetType]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      localStorage.setItem("dismissed_notif_id", notification.id);
      setIsDismissed(true);
    }, 300);
  };

  if (isDismissed || !notification) return null;

  return (
    <div className="fixed top-6 left-0 w-full z-[9999] px-4 md:px-0 pointer-events-none">
      <div className="max-w-[95%] md:max-w-2xl mx-auto pointer-events-auto">
        {/* Modern Glass Morphic Container with Slide Animation */}
        <div 
          className={`transform transition-all duration-500 ease-out-cubic ${
            isVisible 
              ? "translate-y-0 opacity-100 scale-100" 
              : "-translate-y-10 opacity-0 scale-95"
          }`}
        >
          {/* Floating Card with Depth Effect */}
          <div className="relative group overflow-hidden">
            {/* Dynamic Gradient Border */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            {/* Floating Shadow */}
            <div className="absolute inset-0 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transform translate-y-2 group-hover:translate-y-1 transition-transform duration-500"></div>
            
            {/* Main Card */}
            <div className="relative flex items-center justify-between gap-6 
                            bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl 
                            border border-white/30 
                            p-5 md:p-6 rounded-[1.8rem]
                            shadow-[inset_0_1px_0px_0px_rgba(255,255,255,0.8)]">
              
              {/* Left Content */}
              <div className="flex items-center gap-5">
                {/* Dynamic Icon with Glow */}
                <div className="relative">
                  {/* Outer Pulse Ring */}
                  <div className="absolute -inset-3">
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-cyan-400/30 to-blue-500/30 animate-pulse"></div>
                  </div>
                  
                  {/* Icon Container */}
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-900 to-black shadow-2xl">
                    {/* Inner Glow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/20 to-blue-500/20 blur-md"></div>
                    
                    {/* Animated Icon */}
                    <svg 
                      className="w-6 h-6 text-white relative z-10 transform group-hover:scale-110 transition-transform duration-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex flex-col">
                  {/* Label with Gradient */}
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                      Official Announcement
                    </span>
                    {/* Live Indicator */}
                    <div className="flex items-center gap-1">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                      </span>
                      <span className="text-[9px] font-bold text-cyan-500">LIVE</span>
                    </div>
                  </div>
                  
                  {/* Message */}
                  <p className="text-sm md:text-base font-semibold text-gray-900 leading-tight max-w-md">
                    {notification.message}
                  </p>
                  
                  {/* Timestamp (if available) */}
                  {notification.createdAt && (
                    <span className="text-[10px] text-gray-500 font-medium mt-1.5">
                      {new Date(notification.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={handleDismiss}
                className="group/btn relative flex items-center justify-center"
                aria-label="Dismiss notification"
              >
                {/* Button Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-white rounded-xl shadow-sm opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                
                {/* Button Border Animation */}
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-gray-300 to-gray-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                
                {/* Icon */}
                <div className="relative h-10 w-10 flex items-center justify-center rounded-xl transition-all duration-300 group-hover/btn:scale-90">
                  <svg 
                    className="w-5 h-5 text-gray-400 group-hover/btn:text-gray-700 transition-colors duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2.5" 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  </svg>
                </div>
              </button>
            </div>
            
            {/* Progress Bar (Optional - shows notification will auto-dismiss) */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-to-r from-cyan-400 to-blue-500 animate-slide">
                <style jsx>{`
                  @keyframes slide {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(400%); }
                  }
                  .animate-slide {
                    animation: slide 3s ease-in-out infinite;
                  }
                `}</style>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}