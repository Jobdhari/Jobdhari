import { applyToJob, hasCandidateAppliedToJob } from "@/lib/firebase/jobService";
import { auth } from "@/lib/firebase";
export default function JobPage({ params }: { params: { jobId: string } }) {
  const jobId = params.jobId;

  const handleApply = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please login first.");
      return;
    }

    const already = await hasCandidateAppliedToJob(jobId, user.uid);
    if (already) {
      alert("You already applied to this job!");
      return;
    }

    await applyToJob(jobId, user.uid, {
      candidateEmail: user.email ?? "",
      candidateName: user.displayName ?? "",
    });

    alert("Application submitted!");
    window.location.href = "/my-jobs";
  };

  return (
    <div>
      {/* your job UI */}

      <button
        onClick={handleApply}
        className="px-6 py-3 bg-orange-600 text-white rounded-lg mt-6"
      >
        Apply Now
      </button>
    </div>
  );
}
