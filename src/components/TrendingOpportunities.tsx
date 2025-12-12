"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/auth";
import { collection, getDocs, limit, query, orderBy } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const TrendingOpportunities = () => {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"), limit(5));
        const snap = await getDocs(q);
        setJobs(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching trending jobs:", err);
      }
    };

    fetchJobs();
  }, []);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>🔥 Trending Opportunities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job.id} className="p-2 rounded-md border hover:bg-gray-50">
              <p className="font-semibold">{job.title}</p>
              <p className="text-sm text-gray-500">{job.location}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No trending jobs yet</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TrendingOpportunities;
