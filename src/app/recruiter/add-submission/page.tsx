"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AddSubmissionPage() {
  const [formData, setFormData] = useState({
    candidateName: "",
    email: "",
    phone: "",
    skillSet: "",
    clientName: "",
    jobTitle: "",
    status: "Submitted",
    remarks: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const recruiterId = "sample-recruiter-uid"; // TODO: replace with logged-in recruiter UID

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await addDoc(collection(db, "submissions"), {
        ...formData,
        recruiterId,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setFormData({
        candidateName: "",
        email: "",
        phone: "",
        skillSet: "",
        clientName: "",
        jobTitle: "",
        status: "Submitted",
        remarks: "",
      });
    } catch (err) {
      console.error("Error adding submission:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold text-blue-900 mb-6">
        Add Candidate Submission
      </h1>

      <Card className="shadow-sm border rounded-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <Label>Candidate Name</Label>
              <Input
                name="candidateName"
                value={formData.candidateName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Skill Set</Label>
                <Input
                  name="skillSet"
                  value={formData.skillSet}
                  onChange={handleChange}
                  placeholder="e.g. Java, React, QA, Python"
                  required
                />
              </div>
              <div>
                <Label>Client Name</Label>
                <Input
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="e.g. Infosys, TCS"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Job Title</Label>
              <Input
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Full Stack Developer"
              />
            </div>

            <div>
              <Label>Remarks / Notes</Label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={3}
                placeholder="Interview scheduled, candidate not reachable, etc."
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Add Submission"}
              </Button>
            </div>

            {success && (
              <p className="text-green-600 text-sm mt-2">
                ✅ Submission added successfully!
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
