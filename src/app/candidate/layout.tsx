import type { ReactNode } from "react";
import CandidateTopNav from "./CandidateTopNav";

export default function CandidateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Shared candidate tabs */}
      <div className="border-b bg-background">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <CandidateTopNav />
        </div>
      </div>

      {/* Page content */}
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
