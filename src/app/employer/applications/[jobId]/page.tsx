import { db } from "@/lib/firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

export default async function JobApplicationsPage({ params }: any) {
  const q = query(
    collection(db, "applications"),
    where("jobId", "==", params.jobId)
  );

  const snap = await getDocs(q);
  const apps = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Applications</h1>

      {apps.map((a) => (
        <div key={a.id} className="border p-4 rounded-xl bg-white shadow-sm mb-3">
          <p><b>Candidate:</b> {a.candidateId}</p>
          <p><b>Applied:</b> {a.appliedAt}</p>
          {a.resumeURL && (
            <a href={a.resumeURL} className="text-blue-600 underline">
              View Resume
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
