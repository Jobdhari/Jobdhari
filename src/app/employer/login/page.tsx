import { redirect } from "next/navigation";

export default function EmployerLoginAlias() {
  redirect("/login?role=employer");
}
