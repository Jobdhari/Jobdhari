"use client";

import { useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditJobProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: {
    id: string;
    title: string;
    skills: string;
    location: string;
    salary?: string;
    mode?: string;
  };
  onUpdate: () => void;
}

export default function EditJob({ open, onOpenChange, job, onUpdate }: EditJobProps) {
  const [form, setForm] = useState(job);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const jobRef = doc(db, "jobs", job.id);
      await updateDoc(jobRef, { ...form, updatedAt: serverTimestamp() });
      toast.success("Job updated successfully!");
      onOpenChange(false);
      onUpdate(); // Refresh jobs list
    } catch (err) {
      console.error(err);
      toast.error("Error updating job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Edit Job">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="title"
          placeholder="Job Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <Input
          name="skills"
          placeholder="Skills (comma separated)"
          value={form.skills}
          onChange={handleChange}
          required
        />
        <Input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
        />
        <Input
          name="salary"
          placeholder="Salary Range"
          value={form.salary || ""}
          onChange={handleChange}
        />
        <select
          name="mode"
          value={form.mode || "Onsite"}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary"
        >
          <option value="Onsite">Onsite</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Remote">Remote</option>
        </select>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Job"}
        </Button>
      </form>
    </Modal>
  );
}
