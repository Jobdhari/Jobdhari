"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, Loader2 } from "lucide-react";
import LoadingGate from "@/components/LoadingGate";
import { useRoleGuard } from "@/hooks/useRoleGuard";

type Resume = {
  id: string;
  candidateName: string;
  skills: string;
  experience: string;
  education: string;
  summary?: string;
};

export default function ResumeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { loading } = useRoleGuard(["recruiter", "admin"]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    summary: string;
    topSkills: string[];
    missingSkills: string[];
  } | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      if (!id) return;
      const ref = doc(db, "formattedResumes", id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setResume({ id: snap.id, ...snap.data() } as Resume);
      }
    };
    fetchResume();
  }, [id]);

  if (loading) return <LoadingGate />;
  if (!resume)
    return (
      <main className="p-6 text-gray-600">
        <Loader2 className="animate-spin w-4 h-4 inline mr-2" />
        Loading resume...
      </main>
    );

  // ---- Local AI Summarizer (Lightweight heuristic) ----
  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const text =
        `${resume.candidateName}. ${resume.experience}. ${resume.skills}. ${resume.education}.` ||
        "";

      // ⚡ Local lightweight analysis (placeholder for OpenAI API)
      const skillList = text
        .split(/[,\.\|]/)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 2);

      const topSkills = Array.from(new Set(skillList)).slice(0, 5);

      const desiredSkills = ["react", "node", "python", "sql", "communication"];
      const missingSkills = desiredSkills.filter(
        (s) => !skillList.includes(s)
      );

      const summary = `This candidate shows strong experience across ${topSkills
        .slice(0, 3)
        .join(", ")}. Potential areas to explore include ${missingSkills
        .slice(0, 2)
        .join(", ")}.`;

      setAnalysis({ summary, topSkills, missingSkills });
    } catch (err) {
      console.error("AI analysis error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 font-inter">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mr-3 text-gray-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-semibold text-gray-800">
          Resume Details — {resume.candidateName}
        </h1>
      </div>

      <Card className="shadow-sm border border-gray-200 mb-6">
        <CardContent className="p-4 space-y-2">
          <p>
            <span className="font-semibold">Experience:</span>{" "}
            {resume.experience}
          </p>
          <p>
            <span className="font-semibold">Skills:</span> {resume.skills}
          </p>
          <p>
            <span className="font-semibold">Education:</span>{" "}
            {resume.education}
          </p>
        </CardContent>
      </Card>

      {/* ---- AI Analysis Section ---- */}
      <Card className="border-l-4 border-indigo-500 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Brain className="w-5 h-5 text-indigo-500 mr-2" />
              AI Resume Insights
            </h2>
            <Button
              onClick={runAnalysis}
              disabled={analyzing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing...
                </>
              ) : (
                "Generate Insights"
              )}
            </Button>
          </div>

          {analysis ? (
            <div className="space-y-3">
              <p className="text-gray-700">{analysis.summary}</p>
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Top Skills:</span>{" "}
                {analysis.topSkills.join(", ") || "—"}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Missing Skills:</span>{" "}
                {analysis.missingSkills.join(", ") || "—"}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Click “Generate Insights” to analyze this résumé.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
