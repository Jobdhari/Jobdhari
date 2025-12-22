"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EditJobProps = {
  initialTitle: string;
  initialLocation: string;
  onSave: (data: { title: string; location: string }) => Promise<void>;
  onCancel: () => void;
};

export default function EditJob({
  initialTitle,
  initialLocation,
  onSave,
  onCancel,
}: EditJobProps) {
  const [title, setTitle] = useState(initialTitle);
  const [location, setLocation] = useState(initialLocation);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ title: title.trim(), location: location.trim() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Job title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <Input
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 w-full"
        >
          {loading ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
