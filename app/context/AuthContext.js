"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase'; 

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Set loading to true while we perform the multi-collection lookup
      setLoading(true);

      if (firebaseUser) {
        try {
          let userData = null;
          let userRef = null;

          // 1. PRIMARY CHECK: Is this an Admin?
          // We look in the 'admins' collection using the UID as the document ID.
          const adminRef = doc(db, "admins", firebaseUser.uid);
          const adminDoc = await getDoc(adminRef);

          if (adminDoc.exists()) {
            userData = adminDoc.data();
            userRef = adminRef;
          } else {
            // 2. SECONDARY CHECK: Is this a regular User?
            // If not found in 'admins', we check the 'users' collection.
            const standardRef = doc(db, "users", firebaseUser.uid);
            const standardDoc = await getDoc(standardRef);
            
            if (standardDoc.exists()) {
              userData = standardDoc.data();
              userRef = standardRef;
            }
          }

          // 3. AUTO-SYNC VERIFICATION STATUS TO FIRESTORE
          // This allows you to see 'emailVerified: true' in your Firebase console.
          if (userData && userRef) {
            // If Firebase Auth says they are verified, but your DB doesn't know yet:
            if (firebaseUser.emailVerified && !userData.emailVerified) {
              await updateDoc(userRef, { emailVerified: true });
              userData.emailVerified = true; // Update local variable for immediate use
            }
          }

          // 4. CONSTRUCT THE GLOBAL USER OBJECT
          // We prioritize Firebase's official status, then your manual DB override.
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            // MASTER BYPASS: This field will be true if verified by link OR manually in DB
            emailVerified: firebaseUser.emailVerified || userData?.emailVerified || false,
            ...userData // Spreads role, plan, and other Firestore fields
          });

        } catch (error) {
          console.error("Critical Auth Sync Error:", error);
          // Fallback: If Firestore fails, at least provide the basic Firebase identity
          setUser(firebaseUser);
        }
      } else {
        // No user is logged in
        setUser(null);
      }
      
      // Data fetching is complete
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);