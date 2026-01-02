"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function ProtectedRoute({ children, allowedRole }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkUser = async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (!snap.exists()) {
          router.push("/login");
          return;
        }

        const role = snap.data().role;

        if (!role) {
          router.push("/onboarding");
          return;
        }

        // ✅ FIXED: redirect correctly to dashboard URL
        if (allowedRole && role !== allowedRole) {
          router.push(`/dashboard/${role}`);
          return;
        }

        if (isMounted) setLoading(false);
      } catch (error) {
        console.error("Firestore read error:", error);
        if (isMounted) alert("Failed to load user data. Try again.");
        router.push("/login");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setTimeout(() => {
        if (isMounted) checkUser(user);
      }, 0);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router, allowedRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return children;
}
