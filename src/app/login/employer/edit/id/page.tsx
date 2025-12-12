"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams(); // job ID from URL
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobRef = doc(db, "jobs", id as string);
        const snap = await getDoc(jobRef);
        if (snap.exists()) {
          setJob(snap.data());
        } else {
          alert("Job not found");
          router.push("/employer/myjobs");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "jobs", id as string), job);
      alert("✅ Job updated successfully!");
      router.push("/employer/myjobs");
    } catch (err) {
      console.error("Error updating job:", err);
      alert("Error updating job.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading job details...</p>;

  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-50 py-10">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">Edit Job</h1>

      <div className="bg-white shadow-md p-8 rounded-xl w-full max-w-lg">
        <label className="block text-sm font-semibold mb-1">Job Title</label>
        <input name="jobTitle" value={job.jobTitle || ""} onChange={handleChange}
          className="w-full mb-4 p-2 border rounded" />

        <label className="block text-sm font-semibold mb-1">City</label>
        <input name="city" value={job.city || ""} onChange={handleChange}
          className="w-full mb-4 p-2 border rounded" />

        <label className="block text-sm font-semibold mb-1">PIN Code</label>
        <input name="pin" value={job.pin || ""} onChange={handleChange}
          className="w-full mb-4 p-2 border rounded" />

        <label className="block text-sm font-semibold mb-1">Category</label>
        <input name="category" value={job.category || ""} onChange={handleChange}
          className="w-full mb-4 p-2 border rounded" />

        <label className="block text-sm font-semibold mb-1">Description</label>
        <textarea name="description" value={job.description || ""} onChange={handleChange}
          className="w-full mb-4 p-2 border rounded h-24" />

        <div className="flex justify-between">
          <button onClick={() => router.push("/employer/myjobs")}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">
            Cancel
          </button>
          <button onClick={handleSave}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded">
            Save Changes
          </button>
        </div>
      </div>
    </main>
  );
}
