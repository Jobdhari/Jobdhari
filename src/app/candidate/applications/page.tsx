import { auth, db } from "@/lib/firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

export default async function CandidateApplicationsPage() {
  const user = auth.currentUser;
  if (!user) return <p>Not logged in</p>;

  const q = query(collection(db, "applications"), where("candidateId", "==", user.uid));
  const snap = await getDocs(q);

  const apps = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return (
    <div className="p-5 space-y-4">
      <h1 className="text-2xl font-semibold">My Applications</h1>

      {apps.map((app) => (
        <div key={app.id} className="p-4 border rounded-lg shadow-sm bg-white">
          <p><b>Job ID:</b> {app.jobId}</p>
          <p><b>Status:</b> {app.status}</p>
          <p><b>Applied At:</b> {app.appliedAt}</p>

          {app.resumeURL && (
            <a
              href={app.resumeURL}
              target="_blank"
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
