"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Submission {
  id: string;
  candidateName: string;
  email: string;
  phone: string;
  skillSet: string;
  clientName: string;
  jobTitle: string;
  status: string;
  remarks: string;
  createdAt?: { seconds: number };
}

export default function MySubmissionsPage() {
  const recruiterId = "sample-recruiter-uid"; // 🔒 Replace with Auth UID later
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filtered, setFiltered] = useState<Submission[]>([]);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const q = query(
          collection(db, "submissions"),
          where("recruiterId", "==", recruiterId),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const list: Submission[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Submission),
        }));
        setSubmissions(list);
        setFiltered(list);
      } catch (err) {
        console.error("Error loading submissions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  // 🔍 Search filter
  const handleSearch = (term: string) => {
    setSearch(term);
    if (!term.trim()) {
      setFiltered(submissions);
      return;
    }

    const t = term.toLowerCase();
    setFiltered(
      submissions.filter(
        (s) =>
          s.candidateName.toLowerCase().includes(t) ||
          s.clientName.toLowerCase().includes(t) ||
          s.skillSet.toLowerCase().includes(t) ||
          s.jobTitle.toLowerCase().includes(t)
      )
    );
  };

  // 🔹 Update status in Firestore
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      setUpdating(id);
      const ref = doc(db, "submissions", id);
      await updateDoc(ref, { status: newStatus });
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
      setFiltered((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
      toast.success("Status updated");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  // 🔸 Export filtered results to CSV
  const exportToCSV = () => {
    const headers = [
      "Candidate Name",
      "Email",
      "Phone",
      "Skill Set",
      "Client Name",
      "Job Title",
      "Status",
      "Remarks",
      "Created At",
    ];

    const rows = filtered.map((s) => [
      s.candidateName,
      s.email,
      s.phone,
      s.skillSet,
      s.clientName,
      s.jobTitle,
      s.status,
      s.remarks,
      s.createdAt
        ? new Date(s.createdAt.seconds * 1000).toLocaleDateString()
        : "",
    ]);

    const csvContent =
      [headers, ...rows]
        .map((r) => r.map((v) => `"${v ?? ""}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "jobdhari_submissions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusOptions = ["Submitted", "Interview", "Rejected", "Joined"];

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading submissions...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-blue-900">My Submissions</h1>
        <div className="flex gap-3">
          <Button onClick={() => (window.location.href = "/recruiter/add-submission")}>
            + Add New
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            ⬇️ Export CSV
          </Button>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <Input
          placeholder="Search by candidate, client, or skill..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No submissions found.</p>
      ) : (
        <div className="grid gap-4">
          {filtered.map((s) => (
            <Card key={s.id} className="border hover:shadow-md transition rounded-xl">
              <CardContent className="p-5 flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-gray-900">{s.candidateName}</h2>
                  <p className="text-sm text-gray-600">
                    {s.jobTitle || "No job title"} • {s.clientName}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {s.skillSet} | {s.email} | {s.phone}
                  </p>
                  {s.remarks && (
                    <p className="text-xs text-gray-400 mt-2 italic">{s.remarks}</p>
                  )}
                </div>

                <div className="text-right flex flex-col items-end gap-2">
                  <select
                    value={s.status}
                    disabled={updating === s.id}
                    onChange={(e) => updateStatus(s.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-md border focus:ring-2 focus:ring-blue-400 ${
                      s.status === "Joined"
                        ? "bg-green-50 border-green-300 text-green-700"
                        : s.status === "Interview"
                        ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                        : s.status === "Rejected"
                        ? "bg-red-50 border-red-300 text-red-700"
                        : "bg-blue-50 border-blue-300 text-blue-700"
                    }`}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <p className="text-xs text-gray-400 mt-1">
                    {s.createdAt
                      ? new Date(s.createdAt.seconds * 1000).toLocaleDateString()
                      : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
