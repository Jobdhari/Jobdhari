"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/auth";
import { useRoleGuard } from "@/hooks/useRoleGuard";

interface User {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

export default function AdminUsersPage() {
  const { loading } = useRoleGuard(["admin"]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as User[];
      setUsers(data);
      setLoadingUsers(false);
    };
    fetchUsers();
  }, []);

  const toggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "disabled" : "active";
    await updateDoc(doc(db, "users", userId), { status: newStatus });
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
  };

  if (loading || loadingUsers) return <p className="p-8 text-center">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-blue-900 mb-4">Manage Users</h1>
      <div className="overflow-x-auto border rounded-xl shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-blue-50 text-blue-900">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{user.name || "—"}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 capitalize">{user.role}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      user.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {user.status || "active"}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => toggleStatus(user.id, user.status || "active")}
                    className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    {user.status === "active" ? "Disable" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
