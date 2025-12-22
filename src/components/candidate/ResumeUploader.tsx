"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  uploadResume,
  deleteResume,
} from "@/lib/firebase/resumeStorage";

type ResumeUploaderProps = {
  uid: string;
  resumeUrl?: string;
  onUploaded?: (url: string) => void;
};

export default function ResumeUploader({
  uid,
  resumeUrl,
  onUploaded,
}: ResumeUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | undefined>(resumeUrl);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadResume(uid, file);
      setCurrentUrl(url);
      onUploaded?.(url);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUrl) return;

    setUploading(true);
    try {
      await deleteResume(currentUrl);
      setCurrentUrl(undefined);
      onUploaded?.("");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {currentUrl ? (
        <div className="flex items-center gap-3">
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-orange-600 underline"
          >
            View uploaded resume
          </a>

          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={handleDelete}
          >
            {uploading ? "Deleting…" : "Delete"}
          </Button>
        </div>
      ) : (
        <label className="block">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />

          <Button
            type="button"
            disabled={uploading}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {uploading ? "Uploading…" : "Upload Resume"}
          </Button>
        </label>
      )}
    </div>
  );
}
