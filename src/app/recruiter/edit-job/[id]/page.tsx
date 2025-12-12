"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select";
import { db } from "@/lib/firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditJobPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    location: "",
    workMode: "",
    experience: "",
    salary: "",
    skills: "",
    description: "",
    status: "Active",
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const ref = doc(db, "jobs", id as string);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            title: data.title || "",
            location: data.location || "",
            workMode: data.workMode || "",
            experience: data.experience || "",
            salary: data.salary || "",
            skills: (data.skills || []).join(", "),
            description: data.description || "",
            status: data.status || "Active",
          });
        }
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ref = doc(db, "jobs", id as string);
      await updateDoc(ref, {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()),
        updatedAt: new Date(),
      });
      router.push("/recruiter/my-jobs");
    } catch (error) {
      console.error("Error updating job:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen text-gray-600">
        Loading job details...
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <form
        onSubmit={handleSave}
        className="bg-white shadow-md rounded-xl p-8 w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center mb-2">Edit Job</h2>

        <Input
          placeholder="Job Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <Input
          placeholder="Location / City"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />

        <Select onValueChange={(v) => setForm({ ...form, workMode: v })} value={form.workMode}>
          <SelectTrigger><SelectValue placeholder="Work Mode" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Onsite">Onsite</SelectItem>
            <SelectItem value="Hybrid">Hybrid</SelectItem>
            <SelectItem value="Remote">Remote</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Experience (e.g. 3-5 years)"
          value={form.experience}
          onChange={(e) => setForm({ ...form, experience: e.target.value })}
        />
        <Input
          placeholder="Salary (e.g. ₹8–12 LPA)"
          value={form.salary}
          onChange={(e) => setForm({ ...form, salary: e.target.value })}
        />
        <Textarea
          placeholder="Skills (comma-separated)"
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
        />
        <Textarea
          placeholder="Description"
          className="h-24"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <Select onValueChange={(v) => setForm({ ...form, status: v })} value={form.status}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
            <SelectItem value="Paused">Paused</SelectItem>
          </SelectContent>
        </Select>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "Saving Changes..." : "Save Changes"}
        </Button>
      </form>
    </main>
  );
}
