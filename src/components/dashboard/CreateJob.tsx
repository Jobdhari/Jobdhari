"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CreateJob() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-orange-500 hover:bg-orange-600"
      >
        Create Job
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Create Job</h2>

            {/* Job form goes here */}

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600">
                Publish Job
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
