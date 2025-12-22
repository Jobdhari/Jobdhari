"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Submission = {
  id: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  status: string;
  createdAt: string;
};

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!auth.currentUser) return;

      setLoading(true);
      try {
        const q = query(
          collection(db, "submissions"),
          where("employerId", "==", auth.currentUser.uid)
        );

        const snapshot = await getDocs(q);

        const list: Submission[] = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as Omit<Submission, "id">),
          id: docSnap.id, // ✅ assign id last
        }));

        setSubmissions(list);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">My Submissions</h1>

      {submissions.length === 0 ? (
        <p className="text-muted-foreground">No submissions yet.</p>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div key={sub.id} className="rounded-lg border p-4">
              <div className="font-semibold">{sub.candidateName}</div>
              <div className="text-sm text-muted-foreground">
                {sub.candidateEmail}
              </div>
              <div className="mt-1 text-sm">
                Status:{" "}
                <span className="font-medium capitalize">{sub.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
