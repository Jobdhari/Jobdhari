"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Application {
  id: string;
  candidateId: string;
  appliedAt: string;
  status?: string;
}

interface Candidate {
  name?: string;
  email?: string;
  location?: string;
  experience?: string;
  resumeUrl?: string;
}

export default function ViewApplicants() {
  const { jobId } = useParams();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidates, setCandidates] = useState<Record<string, Candidate>>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!jobId) return;
      try {
        const q = query(collection(db, "applications"), where("jobId", "==", jobId));
        const snap = await getDocs(q);
        const apps = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Application[];
        setApplications(apps);

        const data: Record<string, Candidate> = {};
        for (const app of apps) {
          const candidateSnap = await getDoc(doc(db, "users", app.candidateId));
          if (candidateSnap.exists()) {
            data[app.candidateId] = candidateSnap.data() as Candidate;
          }
        }
        setCandidates(data);
      } catch (err) {
        console.error("Error fetching applicants:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [jobId]);

  // ✅ Update application status (Shortlisted / Rejected)
  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      setUpdating(appId);
      const appRef = doc(db, "applications", appId);
      await updateDoc(appRef, { status: newStatus });
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                status: newStatus,
              }
            : a
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Could not update candidate status.");
    } finally {
      setUpdating(null);
    }
  };

  // 🔹 Calculate stats
  const stats = useMemo(() => {
    const total = applications.length;
    const shortlisted = applications.filter((a) => a.status === "shortlisted").length;
    const rejected = applications.filter((a) => a.status === "rejected").length;
    const pending = total - shortlisted - rejected;
    return { total, shortlisted, rejected, pending };
  }, [applications]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading applicants...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-blue-900">
          Applicants Overview
        </h1>
        <Button variant="outline" onClick={() => router.push("/recruiter/dashboard")}>
          ← Back to Dashboard
        </Button>
      </div>

      {/* 🔹 Stats Summary Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="text-center p-4 bg-blue-50 border-blue-200">
          <h3 className="text-sm font-medium text-gray-600">Total</h3>
          <p className="text-xl font-bold text-blue-800">{stats.total}</p>
        </Card>
        <Card className="text-center p-4 bg-green-50 border-green-200">
          <h3 className="text-sm font-medium text-gray-600">Shortlisted</h3>
          <p className="text-xl font-bold text-green-700">{stats.shortlisted}</p>
        </Card>
        <Card className="text-center p-4 bg-red-50 border-red-200">
          <h3 className="text-sm font-medium text-gray-600">Rejected</h3>
          <p className="text-xl font-bold text-red-700">{stats.rejected}</p>
        </Card>
        <Card className="text-center p-4 bg-gray-50 border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Pending</h3>
          <p className="text-xl font-bold text-gray-700">{stats.pending}</p>
        </Card>
      </div>

      {/* Candidate List */}
      {applications.length === 0 ? (
        <p className="text-gray-500">No candidates have applied yet for this job.</p>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => {
            const c = candidates[app.candidateId];
            return (
              <Card key={app.id} className="shadow-sm border rounded-2xl">
                <CardContent className="p-5 flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-medium">
                      {c?.name || "Unknown Candidate"}
                    </h2>
                    <p className="text-gray-600">{c?.email || "No email"}</p>
                    {c?.location && (
                      <p className="text-gray-500 text-sm">{c.location}</p>
                    )}
                    {c?.experience && (
                      <p className="text-gray-500 text-sm mt-1">
                        Experience: {c.experience}
                      </p>
                    )}
                    <p className="text-sm text-gray-400 mt-2">
                      Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${
                        app.status === "shortlisted"
                          ? "bg-green-100 text-green-700"
                          : app.status === "rejected"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {app.status || "Submitted"}
                    </span>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={updating === app.id}
                        onClick={() => handleStatusChange(app.id, "shortlisted")}
                      >
                        {updating === app.id ? "Updating..." : "Shortlist"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={updating === app.id}
                        onClick={() => handleStatusChange(app.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>

                    {c?.resumeUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(c.resumeUrl, "_blank")}
                      >
                        View Resume
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
