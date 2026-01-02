"use client";

// import ProtectedRoute from "@/components/ProtectedRoute";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRole="admin">
      <div className="min-h-screen p-6 bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage users and platform activity.
        </p>
      </div>
    </ProtectedRoute>
  );
}
