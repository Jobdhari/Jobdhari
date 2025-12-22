"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import {
  CandidateQuickPrefs,
  saveCandidateQuickPrefs,
} from "@/lib/firebase/candidatePrefsService";

export default function CandidateQuickApplyPrefs() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [prefs, setPrefs] = useState<CandidateQuickPrefs>({
    autoApply: false,
    notifyOnMatch: true,
    allowRecruiterContact: true,
  });

  useEffect(() => {
    const loadPrefs = async () => {
      if (!auth.currentUser) return;

      try {
        const ref = doc(db, "candidateQuickPrefs", auth.currentUser.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setPrefs({
            autoApply: snap.data().autoApply ?? false,
            notifyOnMatch: snap.data().notifyOnMatch ?? true,
            allowRecruiterContact: snap.data().allowRecruiterContact ?? true,
          });
        }
      } catch (err) {
        console.error("Failed to load quick apply prefs", err);
      } finally {
        setLoading(false);
      }
    };

    loadPrefs();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;

    setSaving(true);
    try {
      await saveCandidateQuickPrefs(auth.currentUser.uid, prefs);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading preferences…</div>;
  }

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <h3 className="text-lg font-semibold">Quick Apply Preferences</h3>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={prefs.autoApply}
          onChange={(e) =>
            setPrefs((p) => ({ ...p, autoApply: e.target.checked }))
          }
        />
        Enable auto-apply to matching jobs
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={prefs.notifyOnMatch}
          onChange={(e) =>
            setPrefs((p) => ({ ...p, notifyOnMatch: e.target.checked }))
          }
        />
        Notify me when a job matches my profile
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={prefs.allowRecruiterContact}
          onChange={(e) =>
            setPrefs((p) => ({
              ...p,
              allowRecruiterContact: e.target.checked,
            }))
          }
        />
        Allow recruiters to contact me directly
      </label>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-orange-500 hover:bg-orange-600"
      >
        {saving ? "Saving…" : "Save Preferences"}
      </Button>
    </div>
  );
}
