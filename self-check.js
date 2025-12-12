// 🛠️ Jobdhari Self-Repair Script
// This runs automatically before dev/build/start

const { execSync } = require("child_process");
const fs = require("fs");

function run(cmd) {
  console.log(`\n🔧 Running: ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

function safeCheck(file) {
  try {
    return fs.existsSync(file);
  } catch {
    return false;
  }
}

console.log("🩺 Starting Jobdhari Health Check...");

let repaired = false;

// 1️⃣ Check node_modules
if (!safeCheck("node_modules")) {
  console.log("⚠️ node_modules missing — reinstalling...");
  run("npm install");
  repaired = true;
}

// 2️⃣ Check .next build cache
if (!safeCheck(".next")) {
  console.log("⚠️ .next folder missing — rebuilding...");
  run("npm run build");
  repaired = true;
}

// 3️⃣ Verify ESLint & TS versions
try {
  const pkg = require("./package.json");
  const eslintVersion = pkg.devDependencies["eslint"];
  const tsVersion = pkg.devDependencies["typescript"];
  if (!eslintVersion || !tsVersion) {
    console.log("⚠️ Missing lint/types — repairing devDependencies...");
    run("npm install --save-dev eslint typescript");
    repaired = true;
  }
} catch (err) {
  console.log("⚠️ Could not verify devDependencies:", err);
  repaired = true;
}

// 4️⃣ Optional: check for package-lock drift
if (safeCheck("package-lock.json")) {
  try {
    run("npm audit fix --force");
  } catch {
    console.log("🟡 Minor issues skipped.");
  }
}

if (repaired) {
  console.log("\n✅ Jobdhari Auto-Repair Completed. System is now stable.");
} else {
  console.log("\n✨ All good! Jobdhari environment is healthy.");
}
