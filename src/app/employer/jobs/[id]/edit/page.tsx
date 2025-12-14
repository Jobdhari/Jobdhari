"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type JobForm = {
  title: string;
  companyName: string;
  location: string;
  pincode: string;
  category: string;
  description: string;
};

export default function EmployerEditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = String(params?.id || "");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<JobForm>({
    title: "",
    companyName: "",
    location: "",
    pincode: "",
    category: "",
    description: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        setLoading(true);

        if (!jobId) throw new Error("Missing job id in URL");

        const ref = doc(db, "jobs", jobId);
        const snap = await getDoc(ref);

        if (!snap.exists()) throw new Error("Job not found");

        const data = snap.data() as any;

        setForm({
          title: data.title ?? "",
          companyName: data.companyName ?? "",
          location: data.location ?? "",
          pincode: data.pincode ?? "",
          category: data.category ?? "",
          description: data.description ?? "",
        });
      } catch (e: any) {
        setError(e?.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [jobId]);

  const onChange =
    (key: keyof JobForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const onSave = async () => {
    try {
      setError(null);
      setSaving(true);

      if (!form.title.trim()) throw new Error("Title is required");

      const ref = doc(db, "jobs", jobId);

      await updateDoc(ref, {
        title: form.title.trim(),
        companyName: form.companyName.trim(),
        location: form.location.trim(),
        pincode: form.pincode.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        updatedAt: serverTimestamp(),
      });

      router.push("/employer/dashboard");
    } catch (e: any) {
      setError(e?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading job…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Job</h1>
        <p className="text-sm text-muted-foreground">Update job details and save.</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4 rounded-lg border bg-white p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input value={form.title} onChange={onChange("title")} placeholder="e.g. Sales Executive" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Company</label>
          <Input value={form.companyName} onChange={onChange("companyName")} placeholder="Company name" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input value={form.location} onChange={onChange("location")} placeholder="City / Area" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Pincode</label>
            <Input value={form.pincode} onChange={onChange("pincode")} placeholder="e.g. 500081" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Input value={form.category} onChange={onChange("category")} placeholder="e.g. Sales" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={form.description}
            onChange={onChange("description")}
            placeholder="Job role, responsibilities, requirements…"
            rows={8}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
