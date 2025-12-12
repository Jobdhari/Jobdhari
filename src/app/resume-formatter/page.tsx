"use client";

import { useEffect, useState, useMemo } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  doc,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Trash2,
  Download,
  BarChart3,
  FileText,
  TrendingUp,
  Search,
  X,
} from "lucide-react";
import jsPDF from "jspdf";
import LoadingGate from "@/components/LoadingGate";
import { useRoleGuard } from "@/hooks/useRoleGuard";

type Resume = {
  id: string;
  candidateName: string;
  skills: string;
  experience: string;
  education: string;
  formattedAt?: { seconds: number };
};

export default function FormattedResumesPage() {
  const { loading } = useRoleGuard(["recruiter", "admin"]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [fetching, setFetching] = useState(true);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [search, setSearch] = useState("");

  if (loading) return <LoadingGate />;

  // ---- Fetch Resumes ----
  useEffect(() => {
    const fetchResumes = async () => {
      setFetching(true);
      try {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
          collection(db, "formattedResumes"),
          where("recruiterId", "==", user.uid),
          orderBy("formattedAt", "desc"),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Resume)
        );
        setResumes(data);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null);
      } catch (err) {
        console.error("Error fetching resumes:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchResumes();
  }, []);

  // ---- Derived Analytics ----
  const analytics = useMemo(() => {
    if (resumes.length === 0) return null;

    const total = resumes.length;
    const allSkills = resumes.flatMap((r) =>
      r.skills
        ? r.skills
            .split(/[,\|]/)
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean)
        : []
    );
    const skillCounts: Record<string, number> = {};
    for (const skill of allSkills) {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    }
    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([skill]) => skill);

    const latest = resumes[0]?.formattedAt
      ? new Date(resumes[0].formattedAt.seconds * 1000).toLocaleDateString()
      : "—";

    return { total, topSkills, latest };
  }, [resumes]);

  // ---- Search Filter ----
  const filteredResumes = useMemo(() => {
    if (!search.trim()) return resumes;
    const s = search.toLowerCase();
    return resumes.filter(
      (r) =>
        r.candidateName.toLowerCase().includes(s) ||
        r.skills.toLowerCase().includes(s) ||
        r.education.toLowerCase().includes(s)
    );
  }, [search, resumes]);

  // ---- Pagination ----
  const loadMore = async () => {
    if (!lastDoc) return;
    try {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(
        collection(db, "formattedResumes"),
        where("recruiterId", "==", user.uid),
        orderBy("formattedAt", "desc"),
        startAfter(lastDoc),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const more = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Resume)
      );
      setResumes((prev) => [...prev, ...more]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null);
    } catch (err) {
      console.error("Error loading more resumes:", err);
    }
  };

  // ---- Delete Resume ----
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this saved resume?")) return;
    try {
      await deleteDoc(doc(db, "formattedResumes", id));
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Could not delete resume.");
    }
  };

  // ---- Download as PDF ----
  const handleDownload = (resume: Resume) => {
    const pdf = new jsPDF();
    const title = "Formatted Resume - " + resume.candidateName;
    pdf.text(title, 10, 20);
    pdf.text("Candidate Name: " + resume.candidateName, 10, 40);
    pdf.text("Experience: " + resume.experience, 10, 50);
    pdf.text("Skills: " + resume.skills, 10, 60);
    pdf.text("Education: " + resume.education, 10, 70);
    pdf.save(`${resume.candidateName}_JobDhari.pdf`);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 font-inter">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Formatted Resumes
        </h1>

        {/* ---- Search Bar ---- */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ---- Analytics Header ---- */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="border-l-4 border-indigo-500 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Resumes</p>
                <p className="text-2xl font-bold text-gray-800">
                  {analytics.total}
                </p>
              </div>
              <FileText className="w-8 h-8 text-indigo-500" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Top Skills</p>
                <p className="text-sm text-gray-700 font-medium">
                  {analytics.topSkills.join(", ") || "—"}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-orange-500 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Last Formatted</p>
                <p className="text-lg font-semibold text-gray-800">
                  {analytics.latest}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ---- Main Grid ---- */}
      {fetching ? (
        <div className="flex items-center justify-center h-40 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading resumes...
        </div>
      ) : filteredResumes.length === 0 ? (
        <p className="text-gray-600">No resumes match your search.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResumes.map((r) => (
            <Card key={r.id} className="shadow-sm border border-gray-200">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {r.candidateName}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                  {r.skills}
                </p>
                <p className="text-xs text-gray-400">
                  Saved on:{" "}
                  {r.formattedAt
                    ? new Date(r.formattedAt.seconds * 1000).toLocaleString()
                    : "—"}
                </p>
                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(r)}
                    className="text-[#4f46e5] border-[#c7d2fe]"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(r.id)}
                    className="text-red-600 border-red-200"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {lastDoc && !search && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={loadMore}
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white"
          >
            Load More
          </Button>
        </div>
      )}
    </main>
  );
}
