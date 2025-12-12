"use client";

import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function SetRolePage() {
  const setRole = async (role: "employer" | "recruiter" | "admin" | "candidate") => {
    const user = auth.currentUser;
    if (!user) return alert("Login first");
    await setDoc(doc(db, "users", user.uid), { role }, { merge: true });
    alert(`Role set to ${role}`);
  };

  return (
    <main className="p-6 space-x-2">
      <button onClick={() => setRole("employer")} className="px-3 py-1 rounded bg-blue-600 text-white">employer</button>
      <button onClick={() => setRole("recruiter")} className="px-3 py-1 rounded bg-blue-600 text-white">recruiter</button>
      <button onClick={() => setRole("admin")} className="px-3 py-1 rounded bg-blue-600 text-white">admin</button>
      <button onClick={() => setRole("candidate")} className="px-3 py-1 rounded bg-blue-600 text-white">candidate</button>
    </main>
  );
}
