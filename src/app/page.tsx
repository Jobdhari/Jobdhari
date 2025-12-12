"use client";

import React from "react";
import { useRouter } from "next/navigation";

const HomePage: React.FC = () => {
  const router = useRouter();

  // Candidate: always go to jobs list
  const handleSearchJobs = () => {
    router.push("/jobs");
  };

  // Employer: go directly to employer dashboard
  const handleEmployerSignup = () => {
    router.push("/employer/dashboard");
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-8 md:px-12">
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-8">
        {/* Left text section */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Find Your Next
            <br />
            Opportunity
          </h1>
          <p className="text-gray-600 text-sm md:text-base mb-6 max-w-xl">
            Explore thousands of job openings carefully curated to match your
            growth path. Your career deserves the right direction.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Candidate button */}
            <button
              onClick={handleSearchJobs}
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium bg-orange-500 text-white hover:bg-orange-600"
            >
              Search Jobs
            </button>

            {/* Employer button */}
            <button
              onClick={handleEmployerSignup}
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium border border-gray-300 text-gray-800 bg-white hover:bg-gray-50"
            >
              I&apos;m Hiring / Post a Job
            </button>
          </div>
        </div>

        {/* Right image placeholder – optional */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="w-full h-48 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
            JobDhari Hero
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
