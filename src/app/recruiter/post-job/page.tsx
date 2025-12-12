"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SubscriptionBadge from "@/components/SubscriptionBadge";
import UpgradeModal from "@/components/UpgradeModal";
import { canPostJob, incrementPostCount } from "@/lib/billing/subscription";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import LoadingGate from "@/components/LoadingGate";

type JobForm = {
  title: string;
  location: string;
  mode: "onsite" | "remote" | "hybrid";
  skills: string;
  salary?: string;
  clientName?: string;
  description: string;
};

export default function RecruiterPostJobPage() {
  const { loading } = useRoleGuard(["recruiter", "admin"]);
  const [form, setForm] = useState<JobForm>({
    title: "",
    location: "",
    mode: "onsite",
    skills: "",
    salary: "",
    clientName: "",
    description: "",
  });
  const [limitReached, setLimitReached] = useState(false);
  const [checking, setChecking] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    (async () => {
      const check = await canPostJob();
      setLimitReached(!check.ok);
      setChecking(false);
    })();
  }, []);

  if (loading || checking) return <LoadingGate />;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (limitReached) {
      alert("You’ve reached your posting limit. Upgrade your plan to continue.");
      return;
    }

    try {
      setPosting(true);
      const user = auth.currentUser;
      if (!user) {
        alert("Please log in first.");
        return;
      }

      await addDoc(collection(db, "jobs"), {
        recruiterId: user.uid,
        title: form.title.trim(),
        location: form.location.trim(),
        mode: form.mode,
        skills: form.skills,
        salary: form.salary || null,
        clientName: form.clientName || null,
        description: form.description.trim(),
        postedBy: "recruiter",
        status: "active",
        createdAt: serverTimestamp(),
      });

      await incrementPostCount();
      alert("Job posted successfully!");
      window.location.href = "/recruiter/jobs";
    } catch (e) {
      console.error(e);
      alert("Error posting job. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Post Job (Recruiter)</h1>
        <SubscriptionBadge />
      </div>

      <Card className="max-w-3xl border border-gray-200 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-600">Job Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Java Developer / Sales Executive"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Hyderabad / Pune"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Work Mode</label>
              <select
                name="mode"
                value={form.mode}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="onsite">On-site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Required Skills (comma separated)</label>
            <input
              name="skills"
              value={form.skills}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Java, Spring Boot, MySQL"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Salary (optional)</label>
              <input
                name="salary"
                value={form.salary}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="₹8–12 LPA"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Client Name (optional)</label>
              <input
                name="clientName"
                value={form.clientName}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="ABC Technologies Pvt Ltd"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Job Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[140px]"
              placeholder="Brief about the role, key responsibilities, interview process, etc."
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={posting || limitReached || !form.title.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {posting ? "Posting…" : limitReached ? "Upgrade to Post" : "Post Job"}
          </Button>
        </CardContent>
      </Card>

      {/* Upgrade dialog if blocked */}
      <UpgradeModal open={limitReached} onClose={() => (window.location.href = "/subscription")} />
    </main>
  );
}
