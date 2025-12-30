import { redirect } from "next/navigation";

export default function CandidateRoot() {
  // All candidates land on dashboard after login
  redirect("/candidate/dashboard");
}
