import { Suspense } from "react";
import LoginClient from "@/app/login/LoginClient";

export default function CandidateLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
