// src/app/apply-wizard/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Non-MVP stub
 * We use /apply/[id] for the MVP job apply flow.
 * Apply Wizard is not part of MVP and is disabled to keep builds green.
 */
export default function ApplyWizardStubPage() {
  return (
    <div className="mx-auto max-w-2xl p-8 space-y-4">
      <h1 className="text-2xl font-bold">Apply Wizard</h1>
      <p className="text-muted-foreground">
        This page is disabled in MVP. Use Jobs → Apply instead.
      </p>

      <div className="flex gap-2">
        <Button asChild>
          <Link href="/jobs">Browse jobs</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
