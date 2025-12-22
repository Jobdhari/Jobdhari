// testRules.ts — Full Working Version

import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";

import fs from "fs";

// Load your Firestore rules file
const rules = fs.readFileSync("firestore.rules", "utf8");

const PROJECT_ID = "jobdhari-test";

async function runTests() {
  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
    },
  });

  console.log("🔥 Firestore test environment initialized");

  // -----------------------------
  // MOCK USERS
  // -----------------------------

  // Employer Auth
  const employerAuth = {
    uid: "employer_123",
    token: {
      role: "employer",
    },
  };

  // Candidate Auth
  const candidateAuth = {
    uid: "candidate_999",
    token: {
      role: "candidate",
    },
  };

  // -----------------------------
  // FIRESTORE REFERENCES
  // -----------------------------

  const employerDb = testEnv.authenticatedContext(
    employerAuth.uid,
    employerAuth.token
  ).firestore();

  const candidateDb = testEnv.authenticatedContext(
    candidateAuth.uid,
    candidateAuth.token
  ).firestore();

  const employerJobRef = employerDb.collection("jobs").doc("job1");
  const candidateJobRef = candidateDb.collection("jobs").doc("job2");

  // -----------------------------
  // JOB DATA (Employer MUST include employerId)
  // -----------------------------
  const validJob = {
    title: "Software Engineer",
    company: "JobDhari",
    description: "Build features",
    location: "Hyderabad",
    workMode: "Hybrid",
    experience: "3+ years",
    salary: "8 LPA",
    skills: ["React", "Next.js"],
    recruiterId: "recruiter_111",
    employerId: employerAuth.uid, // ✅ Must match Firestore rule requirement
    status: "open",
    createdAt: Date.now(),
    isPublic: true,
    applicationsCount: 0,
  };

  // -----------------------------
  // TEST 1 — Employer CAN create job
  // -----------------------------
  try {
    await assertSucceeds(employerJobRef.set(validJob));
    console.log("✅ Employer write succeeded");
  } catch (err) {
    console.error("❌ Employer write failed", err);
  }

  // -----------------------------
  // TEST 2 — Candidate CANNOT create job
  // -----------------------------
  try {
    await assertFails(candidateJobRef.set(validJob));
    console.log("✅ Candidate write correctly blocked");
  } catch (err) {
    console.error("❌ Candidate write unexpectedly succeeded", err);
  }

  // -----------------------------
  // TEST 3 — Candidate CAN READ jobs
  // -----------------------------
  try {
    await assertSucceeds(candidateDb.collection("jobs").get());
    console.log("✅ Candidate read succeeded");
  } catch (err) {
    console.error("❌ Candidate read failed", err);
  }

  // Cleanup
  await testEnv.cleanup();
  console.log("✨ Tests finished, environment cleaned up");
}

runTests();
