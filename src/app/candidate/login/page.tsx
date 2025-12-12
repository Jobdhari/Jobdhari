import { redirect } from "next/navigation";

export default function CandidateLoginAlias() {
  redirect("/login?role=candidate");
}
