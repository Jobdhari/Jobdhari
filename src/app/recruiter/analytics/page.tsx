"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RecruiterAnalytics() {
  const recruiterId = "sample-recruiter-uid"; // 🔒 Replace later with auth UID
  const [data, setData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [clientData, setClientData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const q = query(collection(db, "submissions"), where("recruiterId", "==", recruiterId));
        const snapshot = await getDocs(q);
        const subs = snapshot.docs.map((d) => d.data());

        // 📊 Group by month
        const monthlyCounts: Record<string, number> = {};
        subs.forEach((s) => {
          if (s.createdAt?.seconds) {
            const date = new Date(s.createdAt.seconds * 1000);
            const month = date.toLocaleString("default", { month: "short" });
            monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
          }
        });
        setData(Object.entries(monthlyCounts).map(([month, count]) => ({ month, count })));

        // 🟩 Group by status
        const statusCounts: Record<string, number> = {};
        subs.forEach((s) => {
          const st = s.status || "Submitted";
          statusCounts[st] = (statusCounts[st] || 0) + 1;
        });
        setStatusData(
          Object.entries(statusCounts).map(([status, value]) => ({ name: status, value }))
        );

        // 🧠 Group by client
        const clientCounts: Record<string, number> = {};
        subs.forEach((s) => {
          const client = s.clientName || "Unknown";
          clientCounts[client] = (clientCounts[client] || 0) + 1;
        });
        const topClients = Object.entries(clientCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6);
        setClientData(topClients);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading analytics...
      </div>
    );

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold text-blue-900 mb-8">
        Recruiter Analytics Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="border rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Submissions by Month</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Status Breakdown</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Clients</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={clientData} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={90} />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
