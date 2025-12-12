"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

export default function CreateJob() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    skills: "",
    location: "",
    salary: "",
    mode: "Onsite",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.skills || !form.location)
      return toast.error("Please fill in all required fields.");

    try {
      setLoading(true);
      await addDoc(collection(db, "jobs"), {
        ...form,
        createdAt: serverTimestamp(),
      });
      toast.success("Job posted successfully!");
      setOpen(false);
      setForm({ title: "", skills: "", location: "", salary: "", mode: "Onsite" });
    } catch (err: any) {
      console.error(err);
      toast.error("Error posting job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="accent" onClick={() => setOpen(true)}>
        Create Job
      </Button>

      <Modal open={open} onOpenChange={setOpen} title="Create Job Posting">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="title"
            placeholder="Job Title (e.g. React Developer)"
            value={form.title}
            onChange={handleChange}
            required
          />
          <Input
            name="skills"
            placeholder="Required Skills (comma separated)"
            value={form.skills}
            onChange={handleChange}
            required
          />
          <Input
            name="location"
            placeholder="Location (e.g. Hyderabad, Remote)"
            value={form.location}
            onChange={handleChange}
            required
          />
          <Input
            name="salary"
            placeholder="Salary Range (optional)"
            value={form.salary}
            onChange={handleChange}
          />

          <select
            name="mode"
            value={form.mode}
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
            loading={loading}
            className="w-full mt-2"
          >
            Post Job
          </Button>
        </form>
      </Modal>
    </>
  );
}
