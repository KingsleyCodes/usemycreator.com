"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  doc, getDoc, collection, addDoc, query, 
  orderBy, onSnapshot, serverTimestamp, updateDoc 
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

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
      // Scroll to bottom on new message
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsubscribe();
  }, [chatId]);

  // ✅ 3. Send Message Function
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage;
    setNewMessage(""); // Clear input immediately for UX

    try {
      const msgsRef = collection(db, "chats", chatId, "messages");
      await addDoc(msgsRef, {
        text: messageText,
        senderId: user.uid,
        createdAt: serverTimestamp(),
      });

      // Update the main chat doc with the latest snippet
      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: messageText,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (!chatData || !user) return <div className="h-screen flex items-center justify-center bg-white italic">Loading encrypted channel...</div>;

  // Determine who the "Other Person" is
  const isBusiness = user.uid === chatData.businessId;
  const otherName = isBusiness ? chatData.creatorName : chatData.businessName;

  return (
    <div className="flex flex-col h-screen bg-[#f7f7f7]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 p-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h2 className="font-black text-gray-900 tracking-tight">{otherName}</h2>
          <p className="text-[10px] font-bold text-[#a3dcf3] uppercase tracking-widest">Active Discussion</p>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isMe = m.senderId === user.uid;
          return (
            <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] p-4 rounded-[1.5rem] shadow-sm ${
                isMe 
                ? "bg-black text-white rounded-br-none" 
                : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
              }`}>
                <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                <p className={`text-[8px] mt-2 font-bold uppercase opacity-50 ${isMe ? "text-right" : "text-left"}`}>
                  {m.createdAt?.toDate ? new Date(m.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Sending..."}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-2">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[#a3dcf3] transition-all"
          />
          <button 
            type="submit"
            className="bg-[#a3dcf3] hover:bg-[#8ccce6] text-black px-8 py-4 rounded-2xl font-black transition-all shadow-md"
          >
            SEND
          </button>
        </form>
      </footer>
    </div>
  );
}