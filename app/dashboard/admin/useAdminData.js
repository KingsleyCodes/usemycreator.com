"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useAdminData() {
  const [creators, setCreators] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [transactions, setTransactions] = useState([]); 
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listen for Creators
    const unsubCreators = onSnapshot(collection(db, "creators"), (snap) => {
      setCreators(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 2. Listen for Businesses
    const unsubBiz = onSnapshot(collection(db, "businesses"), (snap) => {
      setBusinesses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 3. Listen for Campaigns
    const unsubCamps = onSnapshot(collection(db, "campaigns"), (snap) => {
      setCampaigns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 4. Listen for Payouts (Withdrawals)
    const withdrawalQuery = query(collection(db, "withdrawals"), orderBy("createdAt", "desc"));
    const unsubWithdrawals = onSnapshot(withdrawalQuery, (snap) => {
      setPayouts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 5. Listen for Transactions
    const transQuery = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
    const unsubTrans = onSnapshot(transQuery, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 6. Listen for Global Notifications (Broadcasts)
    const notifQuery = query(collection(db, "global_notifications"), orderBy("createdAt", "desc"));
    const unsubNotifs = onSnapshot(notifQuery, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      // Once the last listener is ready, we stop the loading state
      setLoading(false);
    });

    // CLEANUP: Stop listeners when the admin leaves the dashboard
    return () => {
      unsubCreators();
      unsubBiz();
      unsubCamps();
      unsubWithdrawals();
      unsubTrans();
      unsubNotifs();
    };
  }, []);

  return { 
    creators, 
    businesses, 
    campaigns, 
    payouts, 
    transactions, 
    notifications, 
    loading 
  };
}