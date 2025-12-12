"use client";

import { useRoleGuard } from "@/hooks/useRoleGuard";

export default function AdminDashboard() {
  const { loading } = useRoleGuard(["admin"]);

  if (loading) return <p className="text-center mt-10">Checking access...</p>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-blue-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mb-4">
          Welcome, Admin. You have full control over employers, recruiters, and system settings.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <a
            href="/admin/users"
            className="p-4 rounded-lg border hover:shadow-sm transition bg-blue-50"
          >
            <h2 className="font-semibold text-blue-800">Manage Users</h2>
            <p className="text-sm text-gray-600">Review or deactivate accounts</p>
          </a>
          <a
            href="/admin/jobs"
            className="p-4 rounded-lg border hover:shadow-sm transition bg-green-50"
          >
            <h2 className="font-semibold text-green-800">Moderate Job Posts</h2>
            <p className="text-sm text-gray-600">Approve, edit, or remove listings</p>
          </a>
          <a
            href="/admin/reports"
            className="p-4 rounded-lg border hover:shadow-sm transition bg-yellow-50"
          >
            <h2 className="font-semibold text-yellow-800">View Reports</h2>
            <p className="text-sm text-gray-600">Check analytics and activity</p>
          </a>
          <a
            href="/"
            className="p-4 rounded-lg border hover:shadow-sm transition bg-red-50"
          >
            <h2 className="font-semibold text-red-800">Back to Home</h2>
            <p className="text-sm text-gray-600">Return to main site</p>
          </a>
        </div>
      </div>
    </div>
  );
}
