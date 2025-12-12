"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";

export default function CandidateApplicationCard({ app }: { app: any }) {
  return (
    <Card className="p-5 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-3">
        
        <div>
          <p className="text-lg font-semibold text-gray-800">{app.jobTitle}</p>
          <p className="text-sm text-gray-500">{app.company || "Company Confidential"}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {app.experienceYears && (
            <div>
              <p className="text-gray-500 text-xs">Experience You Entered</p>
              <p className="font-medium">{app.experienceYears} yrs</p>
            </div>
          )}
          {app.expectedSalary && (
            <div>
              <p className="text-gray-500 text-xs">Expected Salary</p>
              <p className="font-medium">{app.expectedSalary}</p>
            </div>
          )}
        </div>

        {/* Note */}
        {app.note && (
          <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
            <span className="font-medium">Your Note:</span> {app.note}
          </div>
        )}

        {/* Resume Download */}
        <div className="pt-2">
          <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>View Submitted Resume</span>
            </Button>
          </a>
        </div>

        {/* View Job Link */}
        <a
          href={`/jobs/${app.jobId}`}
          className="text-amber-700 font-medium flex items-center space-x-1 text-sm"
        >
          <span>View Job Posting</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        {/* Date */}
        <p className="text-xs text-gray-400 pt-1">
          Applied: {app.createdAt?.toDate?.().toLocaleString() || "Unknown"}
        </p>
      </div>
    </Card>
  );
}
