"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/auth";
import { collection, query, where, getCountFromServer } from "firebase/firestore";

export default function RecruiterDashboard() {
  const router = useRouter();
  const [jobCount, setJobCount] = useState<number>(0);
  const [applicantCount, setApplicantCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const recruiterId = "sample-recruiter-uid"; // TODO: replace with logged-in recruiter UID later

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Count jobs posted by recruiter
        const jobsQuery = query(collection(db, "jobs"), where("postedBy", "==", recruiterId));
        const jobSnap = await getCountFromServer(jobsQuery);
        const totalJobs = jobSnap.data().count || 0;

        // Count total applications across their jobs
        const appsQuery = query(collection(db, "applications"), where("recruiterId", "==", recruiterId));
        const appsSnap = await getCountFromServer(appsQuery);
        const totalApplicants = appsSnap.data().count || 0;

        setJobCount(totalJobs);
        setApplicantCount(totalApplicants);
      } catch (err) {
        console.error("Error fetching recruiter stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-blue-900">
          Recruiter Dashboard
        </h1>
        <Button variant="outline" onClick={() => router.push("/recruiter/profile")}>
          Edit Profile
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center p-4 bg-blue-50 border-blue-200">
          <h3 className="text-sm font-medium text-gray-600">Jobs Posted</h3>
          <p className="text-xl font-bold text-blue-800">{jobCount}</p>
        </Card>
        <Card className="text-center p-4 bg-green-50 border-green-200">
          <h3 className="text-sm font-medium text-gray-600">Total Applicants</h3>
          <p className="text-xl font-bold text-green-700">{applicantCount}</p>
        </Card>
        <Card className="text-center p-4 bg-yellow-50 border-yellow-200">
          <h3 className="text-sm font-medium text-gray-600">Active Jobs</h3>
          <p className="text-xl font-bold text-yellow-700">
            {jobCount > 0 ? jobCount - 1 : 0}
          </p>
        </Card>
        <Card className="text-center p-4 bg-gray-50 border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Inactive Jobs</h3>
          <p className="text-xl font-bold text-gray-700">
            {jobCount > 0 ? 1 : 0}
          </p>
        </Card>
      </div>

      {/* Action shortcuts */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card
          className="hover:shadow-lg border rounded-2xl cursor-pointer"
          onClick={() => router.push("/recruiter/post-job")}
        >
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              Post a New Job
            </h2>
            <p className="text-gray-500 text-sm">
              Create and publish new job listings instantly.
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg border rounded-2xl cursor-pointer"
          onClick={() => router.push("/recruiter/my-jobs")}
        >
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              View My Jobs
            </h2>
            <p className="text-gray-500 text-sm">
              Manage all your job posts and view applicants.
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg border rounded-2xl cursor-pointer"
          onClick={() => router.push("/recruiter/add-submission")}
        >
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              Add Candidate Submission
            </h2>
            <p className="text-gray-500 text-sm">
              Log candidate details for internal or client tracking.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
