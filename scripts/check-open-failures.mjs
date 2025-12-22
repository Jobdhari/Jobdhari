import fs from "node:fs";

const FILE = "FAILURE_LOG.md";

if (!fs.existsSync(FILE)) {
  console.log(`⚠️ ${FILE} not found. Skipping.`);
  process.exit(0);
}

const text = fs.readFileSync(FILE, "utf8");
const lines = text.split(/\r?\n/);

const failIdRe = /^##\s+(FAIL-\d{4}-\d{2}-\d{2}-\d{2})\s+—\s+(.+)$/;
const statusRe = /^\*\*Status:\*\*\s+(⛔\s*Open|✅\s*Resolved)\b/;
const fixedInRe = /^\*\*Fixed In:\*\*\s+(DEV-\d{4}-\d{2}-\d{2}-\d{2})\b/;

let current = null;
const items = [];

for (const line of lines) {
  const mId = line.match(failIdRe);
  if (mId) {
    if (current) items.push(current);
    current = {
      id: mId[1],
      title: mId[2].trim(),
      status: null,
      fixedIn: null,
    };
    continue;
  }

  if (!current) continue;

  const mStatus = line.match(statusRe);
  if (mStatus) {
    current.status = mStatus[1].includes("Open") ? "OPEN" : "RESOLVED";
    continue;
  }

  const mFixed = line.match(fixedInRe);
  if (mFixed) {
    current.fixedIn = mFixed[1];
    continue;
  }
}

if (current) items.push(current);

const open = items.filter((x) => x.status === "OPEN");
const resolvedMissingLink = items.filter(
  (x) => x.status === "RESOLVED" && !x.fixedIn
);

if (open.length === 0 && resolvedMissingLink.length === 0) {
  console.log("✅ Failure log check: OK (no open failures + resolved have Fixed In).");
  process.exit(0);
}

if (open.length) {
  console.log("\n⛔ Open failures detected:");
  for (const f of open) console.log(`- ${f.id} — ${f.title}`);
}

if (resolvedMissingLink.length) {
  console.log("\n⛔ Resolved failures missing **Fixed In:**");
  for (const f of resolvedMissingLink) console.log(`- ${f.id} — ${f.title}`);
}

console.log("\nFix FAILURE_LOG.md before committing.");
process.exit(1);
