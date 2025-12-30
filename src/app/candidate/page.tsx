import { Suspense } from "react";
import LoginClient from "@/app/login/LoginClient";

export default function CandidatePage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
