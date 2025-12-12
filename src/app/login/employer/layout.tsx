// src/app/login/employer/layout.tsx
import type { ReactNode } from "react";

export default function EmployerLoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4">
      {children}
    </div>
  );
}
