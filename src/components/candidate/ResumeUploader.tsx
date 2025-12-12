// src/components/candidate/ResumeUploader.tsx
"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  uploadResumeToStorage,
  deleteResumeFromStorage,
} from "@/lib/firebase/resumeStorage";

type ResumeUploaderProps = {
  userId: string;
  /** Optional existing resume URL so we can replace it */
  existingResumeUrl?: string;
  /** Optional callback when a new resume is uploaded */
  onUploaded?: (url: string) => void;
};

export default function ResumeUploader({
  userId,
  existingResumeUrl,
  onUploaded,
}: ResumeUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChooseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset messages
    setMessage(null);
    setError(null);

    // Basic validation: only PDF or Word, max 5 MB
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF or Word document.");
      event.target.value = "";
      return;
    }

    const maxBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxBytes) {
      setError("File is too large. Max size is 5 MB.");
      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      // If there was an existing resume, try to delete it
      if (existingResumeUrl) {
        await deleteResumeFromStorage(existingResumeUrl);
      }

      const url = await uploadResumeToStorage(userId, file);

      setMessage("Resume uploaded successfully.");
      if (onUploaded) onUploaded(url);
      console.log("Resume uploaded. URL:", url);
    } catch (err) {
      console.error("Error uploading resume:", err);
      setError("Could not upload resume. Please try again.");
    } finally {
      setUploading(false);
      // Clear the selected file so user can re-select the same file if needed
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleFileChange}
      />

      <Button type="button" onClick={handleChooseClick} disabled={uploading}>
        {uploading ? "Uploading…" : "Choose file"}
      </Button>

      {message && (
        <p className="text-sm text-emerald-600 mt-1">{message}</p>
      )}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
