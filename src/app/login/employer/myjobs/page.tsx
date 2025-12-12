"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";

interface Job {
  id: string;
  title: string;
  city: string;
  pincode: string;
  category: string;
  description: string;
  email: string;
  timestamp: any;
}

const MyJobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) fetchJobs(currentUser.email);
  }, [currentUser]);

  const fetchJobs = async (email: string) => {
    const querySnapshot = await getDocs(collection(db, "jobs"));
    const filteredJobs = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Job))
      .filter((job) => job.email === email);
    setJobs(filteredJobs);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "jobs", id));
    fetchJobs(currentUser.email);
  };

  // ✅ Repost function with WhatsApp notification
  const handleRepost = async (id: string) => {
    try {
      const jobRef = doc(db, "jobs", id);
      await updateDoc(jobRef, { repostedAt: new Date() });

      // Send WhatsApp test message
      await fetch("/api/send-test");

      alert("✅ Job reposted & WhatsApp notification sent!");
      fetchJobs(currentUser.email);
    } catch (error) {
      console.error("Error reposting job:", error);
      alert("⚠️ Failed to repost job.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/employer";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-3xl font-bold text-orange-600">My Posted Jobs</h1>
        <button
  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
  onClick={handleLogout}
>
  Logout
</button>
      </div>

      <div className="flex flex-col items-center gap-4 mt-4">
        {jobs.length === 0 ? (
          <p>No jobs posted yet.</p>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-4 rounded-xl shadow-md w-[90%] max-w-2xl"
            >
              <p>📍 {job.city} - {job.pincode}</p>
              <p>🏭 {job.category}</p>
              <p className="font-semibold">{job.title}</p>
              <p className="text-sm text-gray-600">{job.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                Posted by: {job.email}
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => handleDelete(job.id)}
                >
                  Delete
                </Button>
                <Button
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => handleRepost(job.id)}
                >
                  Repost / Boost 🚀
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyJobsPage;