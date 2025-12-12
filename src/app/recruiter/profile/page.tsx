"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function RecruiterProfileSetup() {
  const router = useRouter();
  const [form, setForm] = useState({
    region: "",
    experience: "",
    domain: "",
    city: "",
    openToWork: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    await setDoc(doc(db, "recruiters", user.uid), form, { merge: true });
    router.push("/recruiter/dashboard");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-xl p-8 w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center mb-2">Recruiter Profile Setup</h2>

        <Select onValueChange={(v) => setForm({ ...form, region: v })}>
          <SelectTrigger><SelectValue placeholder="Region / Market" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="India">India</SelectItem>
            <SelectItem value="US">US</SelectItem>
            <SelectItem value="UK">UK</SelectItem>
            <SelectItem value="Europe">Europe</SelectItem>
            <SelectItem value="APAC">APAC</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Experience (in years)"
          type="number"
          value={form.experience}
          onChange={(e) => setForm({ ...form, experience: e.target.value })}
        />
        <Input
          placeholder="Primary Domain / Industry"
          value={form.domain}
          onChange={(e) => setForm({ ...form, domain: e.target.value })}
        />
        <Input
          placeholder="Current City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={form.openToWork}
            onChange={(e) => setForm({ ...form, openToWork: e.target.checked })}
          />
          Open to Work
        </label>

        <Button type="submit" className="w-full">Save and Continue</Button>
      </form>
    </main>
  );
}
