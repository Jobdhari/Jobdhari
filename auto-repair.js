// 🕒 Jobdhari Automatic Daily Self-Repair
// Runs a full system health check once every 24 hours.

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const lastRunFile = path.join(__dirname, ".last-repair-run");

function run(cmd) {
  console.log(`\n🔧 Running: ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

// Check when the last repair was done
let lastRun = 0;
if (fs.existsSync(lastRunFile)) {
  try {
    lastRun = parseInt(fs.readFileSync(lastRunFile, "utf8"), 10);
  } catch {
    lastRun = 0;
  }
}

const now = Date.now();
const hoursSince = (now - lastRun) / (1000 * 60 * 60);

if (hoursSince >= 24) {
  console.log("🧠 Running daily Jobdhari auto-repair check...");
  try {
    run("node ./self-check.js");
    fs.writeFileSync(lastRunFile, `${Date.now()}`);
    console.log("✅ Daily repair completed successfully!");
  } catch (err) {
    console.error("❌ Auto-repair failed:", err.message);
  }
} else {
  console.log(`⏳ Last repair was ${hoursSince.toFixed(1)}h ago — skipping.`);
}
