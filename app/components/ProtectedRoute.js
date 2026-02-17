"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function ProtectedRoute({ children, allowedRole }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkUser = async (user) => {
      if (!user) {
        if (isMounted) router.push("/login");
        return;
      }

      // ==========================================================
      // NEW SECURITY LAYER: EMAIL VERIFICATION
      // ==========================================================
      // We force a reload to get the freshest status from Firebase servers
      try {
        await user.reload(); 
        if (!user.emailVerified) {
          if (isMounted) {
            // We sign them out so they can't bypass via state manipulation
            await signOut(auth);
            router.push("/login?error=unverified");
          }
          return;
        }
      } catch (reloadError) {
        console.error("User reload error:", reloadError);
        if (isMounted) router.push("/login");
        return;
      }
      // ==========================================================

      try {
        // 1. Determine which collection to check based on allowedRole
        // This makes the component work for /dashboard/creator, /dashboard/business, and /dashboard/admin
        let collectionName = "users"; // fallback
        if (allowedRole === "creator") collectionName = "creators";
        if (allowedRole === "business") collectionName = "businesses";
        if (allowedRole === "admin") collectionName = "admins";

        const snap = await getDoc(doc(db, collectionName, user.uid));

        // 2. Security: If the document doesn't exist in the REQUIRED collection
        if (!snap.exists()) {
          console.error(`User does not exist in the ${collectionName} collection.`);
          if (isMounted) router.push("/login");
          return;
        }

        const userData = snap.data();

        // 3. ⛔ THE BAN CHECK (Critical for the Admin Ban Feature)
        if (userData.isBanned) {
          await signOut(auth);
          if (isMounted) {
            alert("This account has been suspended.");
            router.push("/login");
          }
          return;
        }

        // 4. Role Authorization
        // Note: For 'admins', we usually don't have a role field, the existence in the collection is enough
        if (allowedRole !== "admin") {
          const role = userData.role;
          if (!role) {
            if (isMounted) router.push("/onboarding");
            return;
          }

          if (role !== allowedRole) {
            if (isMounted) router.push(`/dashboard/${role}`);
            return;
          }
        }

        if (isMounted) setLoading(false);
      } catch (error) {
        console.error("Protection error:", error);
        if (isMounted) router.push("/login");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      checkUser(user);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router, allowedRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin h-8 w-8 border-4 border-[#22c55e] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return children;
}