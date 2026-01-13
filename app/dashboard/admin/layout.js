"use client";


import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute allowedRole="admin">
      <div className="admin-wrapper bg-black min-h-screen">
        {/* You can add an Admin Sidebar here later */}
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  );
}