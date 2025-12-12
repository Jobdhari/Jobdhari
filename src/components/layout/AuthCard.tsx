// src/components/layout/AuthCard.tsx
"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/helpers/utils";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-2xl border border-orange-50 bg-white p-8 shadow-xl shadow-orange-100/40",
        className
      )}
    >
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-orange-600">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>

      <div className="space-y-4">{children}</div>

      {footer ? (
        <div className="mt-4 text-center text-xs text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
