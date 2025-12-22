import dynamic from "next/dynamic";

/**
 * IMPORTANT:
 * This page must NOT import Firebase at build-time (static export/prerender).
 * So we load the Firebase-using UI as a client-only component.
 */
const CandidateLoginClient = dynamic(
  () => import("./CandidateLoginClient"),
  { ssr: false }
);

export default function CandidateLoginPage() {
  return <CandidateLoginClient />;
}
