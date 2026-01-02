"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      const user = auth.currentUser;
      if (!user) return router.push("/login");

      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) return router.push("/login");

      const role = snap.data().role;
      if (!role) return router.push("/onboarding");

      router.push(`/dashboard/${role}`);
    };

    redirect();
  }, [router]);

  return <p className="p-6">Loading dashboard...</p>;
}
