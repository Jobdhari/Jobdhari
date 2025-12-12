"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Recruiter = {
  id: string;
  email: string;
  status: "invited" | "active" | "removed";
  addedAt?: { seconds: number };
};

export default function EmployerRecruitersPage() {
  const [list, setList] = useState<Recruiter[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const loadRecruiters = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(
        collection(db, "companyRecruiters"),
        where("companyId", "==", user.uid),
        orderBy("addedAt", "desc")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Recruiter[];
      setList(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecruiters();
  }, []);

  const addRecruiter = async () => {
    if (!email.trim()) return;
    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, "companyRecruiters"), {
      companyId: user.uid,     // company doc id = owner uid
      email: email.trim().toLowerCase(),
      status: "invited",
      addedAt: serverTimestamp(),
    });

    setEmail("");
    await loadRecruiters();
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Recruiter Access</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="email"
            placeholder="recruiter@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 sm:w-80 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white" onClick={addRecruiter}>
            Invite
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : list.length === 0 ? (
        <p className="text-gray-600">No recruiters yet. Invite by email to grant access later.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => (
            <Card key={r.id} className="border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <p className="font-semibold">{r.email}</p>
                <p className={`text-xs mt-1 ${
                  r.status === "active" ? "text-green-600" :
                  r.status === "removed" ? "text-red-600" : "text-amber-600"
                }`}>
                  {r.status.toUpperCase()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Added: {r.addedAt ? new Date(r.addedAt.seconds * 1000).toLocaleString() : "—"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
