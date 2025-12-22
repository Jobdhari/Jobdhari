"use client";

import RequireAdmin from "@/components/auth/RequireAdmin";

export default function AdminDashboard() {
  return (
    <RequireAdmin>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow">
          <h1 className="mb-2 text-2xl font-semibold text-blue-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome, Admin. You have full control over the system.
          </p>
        </div>
      </div>
    </RequireAdmin>
  );
}
