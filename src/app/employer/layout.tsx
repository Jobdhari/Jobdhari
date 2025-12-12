// src/app/employer/layout.tsx
"use client";

import type { ReactNode } from "react";

export default function EmployerLayout({
  children,
}: {
  children: ReactNode;
}) {
  // ⚠️ TEMP: no auth / role checks here.
  // Later we will add "only employer" protection back
  // once WhatsApp login + roles are fully wired.

  return <>{children}</>;
}
