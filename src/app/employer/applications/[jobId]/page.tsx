import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import type { JobApplication } from "@/lib/firebase/applicationService";

/* ======================================================
   Local view model (extends base application safely)
====================================================== */
type EmployerApplicationRow = JobApplication & {
  resumeURL?: string;
};

/* ======================================================
   Type guard: does this row have a resume URL?
====================================================== */
function hasResumeURL(x: unknown): x is EmployerApplicationRow {
  return (
    !!x &&
    typeof x === "object" &&
    "resumeURL" in x &&
    typeof (x as any).resumeURL === "string" &&
    (x as any).resumeURL.trim() !== ""
  );
}

export default async function JobApplicationsPage({
  params,
}: {
  params: { jobId: string };
}) {
  const q = query(
    collection(db, "applications"),
    where("jobId", "==", params.jobId)
  );

  const snap = await getDocs(q);

  const apps = snap.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as JobApplication)
  );

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Applications</h1>

      {apps.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No applications yet.
        </p>
      )}

      {apps.map((a) => (
        <div
          key={a.id}
          className="border p-4 rounded-xl bg-white shadow-sm mb-3"
        >
          <p>
            <b>Candidate:</b> {a.userId}
          </p>

          <p>
            <b>Applied:</b>{" "}
            {a.appliedAt?.toDate
              ? a.appliedAt.toDate().toLocaleDateString()
              : "—"}
          </p>

          {/* ✅ Safe, typed resume link */}
          {hasResumeURL(a) && (
            <a
              href={a.resumeURL}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              View Resume
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
