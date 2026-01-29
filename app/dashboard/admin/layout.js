"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import AdminNavbar from "@/app/components/AdminNavbar";

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute allowedRole="admin">
      <div className="flex flex-col lg:flex-row min-h-screen bg-[#F9FAFB]">
        {/* The new responsive Sidebar/Navbar we created */}
        <AdminNavbar />
        
        {/* Main Content Area */}
        <main className="flex-1 pb-24 lg:pb-0 relative overflow-y-auto">
          {/* Top Decorative Bar (Optional - for that premium feel) */}
          <div className="hidden lg:block h-2 bg-white border-b border-gray-100" />
          
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}