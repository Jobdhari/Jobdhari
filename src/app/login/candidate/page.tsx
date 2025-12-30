import { redirect } from "next/navigation";

export default function CandidateLoginRoute() {
  redirect("/login?role=candidate");
}
