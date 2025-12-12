// src/components/candidate/ApplyJobModal.tsx
"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal"; // using same Modal pattern as earlier
import { createApplication } from "@/lib/applications";
import { toast } from "sonner";

interface ApplyJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
  employerId?: string | null;
}

export default function ApplyJobModal({
  open,
  onOpenChange,
  jobId,
  jobTitle,
  employerId,
}: ApplyJobModalProps) {
  const user = auth.currentUser;
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    expectedSalary: "",
    experienceYears: "",
    note: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in as a candidate to apply.");
      return;
    }

    try {
      setLoading(true);

      // Load candidate profile to get resumeUrl
      const candidateRef = doc(db, "candidates", user.uid);
      const snap = await getDoc(candidateRef);

      const data = snap.exists() ? snap.data() : null;
      const resumeUrl = data?.resumeUrl as string | undefined;

      if (!resumeUrl) {
        toast.error("Please upload your resume in the Candidate Dashboard before applying.");
        setLoading(false);
        return;
      }

      if (!form.name || !form.email) {
        toast.error("Name and email are required.");
        setLoading(false);
        return;
      }

      await createApplication({
        jobId,
        jobTitle,
        employerId: employerId || null,
        candidateId: user.uid,
        candidateName: form.name,
        candidateEmail: form.email,
        candidatePhone: form.phone || undefined,
        resumeUrl,
        expectedSalary: form.expectedSalary || undefined,
        experienceYears: form.experienceYears || undefined,
        note: form.note || undefined,
      });

      toast.success("Application submitted successfully!");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={`Apply for ${jobTitle}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <Input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          name="phone"
          placeholder="Phone (optional)"
          value={form.phone}
          onChange={handleChange}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            name="expectedSalary"
            placeholder="Expected Salary (optional)"
            value={form.expectedSalary}
            onChange={handleChange}
          />
          <Input
            name="experienceYears"
            placeholder="Years of Experience (optional)"
            value={form.experienceYears}
            onChange={handleChange}
          />
        </div>
        <Textarea
          name="note"
          placeholder="Short note to recruiter (optional)"
          value={form.note}
          onChange={handleChange}
          className="min-h-[90px]"
        />

        <p className="text-xs text-gray-500">
          Your saved resume from Candidate Dashboard will be attached automatically.
        </p>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
    </Modal>
  );
}
