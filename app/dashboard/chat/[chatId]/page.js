"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  doc, getDoc, collection, addDoc, query, 
  orderBy, onSnapshot, serverTimestamp, updateDoc 
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ChevronLeft, Send } from "lucide-react";

export default function ChatPage() {
  const { chatId } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatData, setChatData] = useState(null);
  const [user, setUser] = useState(null);
  const scrollRef = useRef(null);

  // ✅ 1. Auth & Chat Metadata Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return router.push("/login");
      setUser(currentUser);

      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (chatSnap.exists()) {
        setChatData(chatSnap.data());
      } else {
        router.push("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [chatId, router]);

  // ✅ 2. Real-time Message Listener
  useEffect(() => {
    if (!chatId) return;

    const msgsRef = collection(db, "chats", chatId, "messages");
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsubscribe();
  }, [chatId]);

  // ✅ 3. Send Message Function
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage;
    setNewMessage(""); 

    try {
      const msgsRef = collection(db, "chats", chatId, "messages");
      await addDoc(msgsRef, {
        text: messageText,
        senderId: user.uid,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: messageText,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (!chatData || !user) return <div className="h-screen flex items-center justify-center bg-white italic text-sm">Loading encrypted channel...</div>;

  const isBusiness = user.uid === chatData.businessId;
  const otherName = isBusiness ? chatData.creatorName : chatData.businessName;

  return (
    <div className="flex flex-col h-screen bg-[#fcfcfc] overflow-hidden">
      
      {/* --- RESPONSIVE HEADER --- */}
      <header className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors border border-transparent active:border-gray-100"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
          </button>
          
          <div className="flex flex-col">
            <h2 className="font-black text-gray-900 tracking-tight text-sm sm:text-base leading-tight truncate max-w-[150px] sm:max-w-none">
              {otherName}
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-[#a3dcf3] rounded-full animate-pulse" />
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Identity Verified
              </p>
            </div>
          </div>
        </div>

        {/* Institutional Branding Icon */}
        <div className="h-7 w-7 sm:h-9 sm:w-9 bg-black rounded flex items-center justify-center">
           <span className="text-[#a3dcf3] font-black text-[10px] sm:text-xs">M</span>
        </div>
      </header>

      {/* --- RESPONSIVE MESSAGES AREA --- */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide">
        {messages.map((m) => {
          const isMe = m.senderId === user.uid;
          return (
            <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5 px-2">
                {isMe ? "You" : otherName}
              </span>

              <div className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl shadow-sm ${
                isMe 
                ? "bg-black text-white rounded-tr-none" 
                : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
              }`}>
                <p className="text-sm font-medium leading-relaxed break-words">{m.text}</p>
                
                <div className={`flex items-center gap-2 mt-2 opacity-40 ${isMe ? "justify-end" : "justify-start"}`}>
                   <span className="text-[8px] font-bold uppercase tracking-tighter">
                    {m.createdAt?.toDate ? new Date(m.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Sending..."}
                   </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} className="h-4" />
      </main>

      {/* --- RESPONSIVE INPUT AREA --- */}
      <footer className="flex-shrink-0 p-3 sm:p-6 bg-white border-t border-gray-100">
        <form onSubmit={sendMessage} className="max-w-5xl mx-auto flex items-center gap-2 sm:gap-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3.5 sm:py-5 text-sm focus:outline-none focus:bg-white focus:border-[#a3dcf3] transition-all pr-12"
            />
          </div>
          
          <button 
            type="submit"
            className="h-[48px] w-[48px] sm:h-[60px] sm:w-[120px] bg-black text-white rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95 shadow-lg group"
          >
            <span className="hidden sm:block font-black text-xs uppercase tracking-widest">Send</span>
            <Send className="w-4 h-4 sm:w-3 sm:h-3 text-[#a3dcf3] group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
        
        {/* Mobile Safe Area Padding */}
        <div className="h-2 sm:hidden" />
      </footer>
    </div>
  );
}