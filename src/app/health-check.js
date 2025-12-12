/**
 * 🩺 JobDhari Health Check Script
 * ---------------------------------
 * Ensures environment, Firebase, and TypeScript paths are healthy.
 * Now logs results to jobdhari-health.log for admin review.
 */

import fs from "fs";
import path from "path";

console.log("\n🔍 Checking JobDhari environment and setup...\n");

// Create a log file for record-keeping
const logFile = path.resolve("jobdhari-health.log");
const timestamp = new Date().toLocaleString();

function log(message) {
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

try {
  // 1️⃣ Check for .env.local file
  const envPath = path.resolve(".env.local");
  if (!fs.existsSync(envPath)) {
    const msg = "❌ ERROR: Missing .env.local file in project root.";
    console.error(msg);
    log(msg);
    process.exit(1);
  }

  // 2️⃣ Check required Firebase environment variables
  const requiredKeys = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID"
  ];

  const envFile = fs.readFileSync(envPath, "utf8");
  const missingKeys = requiredKeys.filter((key) => !envFile.includes(key));

  if (missingKeys.length > 0) {
    const msg = `⚠️ Missing keys in .env.local:\n${missingKeys.join("\n")}`;
    console.error(msg);
    log(msg);
    process.exit(1);
  }

  // 3️⃣ Check Firebase config file
  const firebasePath = path.resolve("src/lib/firebase.ts");
  if (!fs.existsSync(firebasePath)) {
    const msg = "❌ ERROR: Missing Firebase config file at src/lib/firebase.ts";
    console.error(msg);
    log(msg);
    process.exit(1);
  }

  // 4️⃣ Validate TypeScript config path aliases
  const tsConfigPath = path.resolve("tsconfig.json");
  if (!fs.existsSync(tsConfigPath)) {
    const msg = "❌ ERROR: tsconfig.json not found in project root.";
    console.error(msg);
    log(msg);
    process.exit(1);
  }

  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, "utf8"));
  const paths = tsConfig.compilerOptions?.paths || {};

  if (!paths["@lib/*"] || !paths["@components/*"]) {
    const msg =
      "⚠️ Warning: Missing @lib or @components alias paths in tsconfig.json";
    console.warn(msg);
    log(msg);
  }

  // ✅ Everything OK
  const successMsg = "✅ All good! JobDhari environment is healthy and ready.";
  console.log(successMsg);
  log(successMsg);

  console.log("\n🚀 You may now start the app safely.\n");
  log("🚀 You may now start the app safely.\n");

} catch (error) {
  const msg = `💥 Health check failed with error:\n${error}`;
  console.error(msg);
  log(msg);
  process.exit(1);
}
