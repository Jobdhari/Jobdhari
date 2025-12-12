"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { extractText, formatResume } from "@/utils/formatter";
import { toast } from "sonner";

interface ResumePreviewProps {
  file: File | null;
  onFormatted?: (text: string) => void;
}

export default function ResumePreview({ file, onFormatted }: ResumePreviewProps) {
  const [formattedText, setFormattedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const process = async () => {
      if (!file) return;
      setLoading(true);
      try {
        const raw = await extractText(file);
        const pretty = formatResume(raw);
        setFormattedText(pretty);
        onFormatted?.(pretty);
      } catch (err) {
        toast.error("Could not process resume");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    process();
  }, [file]);

  return (
    <Card className="border border-gray-200 shadow-sm mt-6">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Formatted Preview
        </h2>

        {loading && <p className="text-sm text-gray-500">Formatting resume ...</p>}

        {!loading && formattedText && (
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md text-sm font-sans leading-relaxed max-h-[500px] overflow-y-auto border">
            {formattedText}
          </pre>
        )}

        {!loading && !formattedText && (
          <p className="text-gray-500 text-sm">Upload a resume to see preview.</p>
        )}

        {formattedText && (
          <Button
            className="mt-4 bg-brand-orange hover:bg-brand-blue text-white"
            onClick={() => {
              navigator.clipboard.writeText(formattedText || "");
              toast.success("Copied formatted text");
            }}
          >
            Copy Formatted Text
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
