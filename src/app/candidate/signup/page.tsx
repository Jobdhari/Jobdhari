import { redirect } from "next/navigation";

/**
 * @feature Candidate Entry
 * @responsibility Redirect legacy signup route to canonical login flow
 * @routes /candidate/signup
 * @files src/app/candidate/signup/page.tsx
 */

export default function CandidateSignupRedirect() {
  redirect("/login?redirect=/candidate");
}
