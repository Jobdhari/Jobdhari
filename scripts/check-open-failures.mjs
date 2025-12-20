import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "FAILURE_LOG.md");

if (!fs.existsSync(FILE)) {
  console.error("❌ FAILURE_LOG.md not found");
  process.exit(1);
}

const content = fs.readFileSync(FILE, "utf8");
const lines = content.split("\n");

// Track open failures by severity
const open = {
  P0: [],
  P1: [],
  P2: [],
  UNKNOWN: [],
};

let current = null;

function pushIfOpen(block) {
  if (!block) return;
  if (block.status !== "OPEN") return;

  const sev = block.severity || "UNKNOWN";
  if (sev === "P0") open.P0.push(block);
  else if (sev === "P1") open.P1.push(block);
  else if (sev === "P2") open.P2.push(block);
  else open.UNKNOWN.push(block);
}

for (const line of lines) {
  // New failure block
  const idMatch = line.match(/^## (F-\d+)/);
  if (idMatch) {
    pushIfOpen(current);
    current = { id: idMatch[1], status: "UNKNOWN", severity: "UNKNOWN" };
    continue;
  }

  // Ignore anything until first failure header
  if (!current) continue;

  // Status parse
  if (line.includes("Status:")) {
    if (line.includes("⛔ Open")) current.status = "OPEN";
    if (line.includes("✅ Resolved")) current.status = "RESOLVED";
  }

  // Severity parse (supports: "Severity: 🔴 P0" OR "Severity: P0")
  if (line.includes("Severity:")) {
    const m = line.match(/\bP0\b|\bP1\b|\bP2\b/);
    if (m) current.severity = m[0];
  }
}

// Final block
pushIfOpen(current);

// Summary
const p0 = open.P0.length;
const p1 = open.P1.length;
const p2 = open.P2.length;
const unk = open.UNKNOWN.length;

console.log("📌 Open failures summary");
console.log(`P0: ${p0}`);
console.log(`P1: ${p1}`);
console.log(`P2: ${p2}`);
if (unk) console.log(`UNKNOWN: ${unk}`);

function printList(label, arr) {
  if (arr.length === 0) return;
  console.log(`\n${label}`);
  for (const f of arr) console.log(` - ${f.id}`);
}

// Print details
printList("🔴 Open P0 failures (release blockers):", open.P0);
printList("🟠 Open P1 failures:", open.P1);
printList("🟡 Open P2 failures:", open.P2);
printList("⚪ Open UNKNOWN severity failures:", open.UNKNOWN);

// Exit rule
if (p0 > 0) {
  console.log("\n⛔ NOT SAFE TO SHIP: open P0 failures exist.");
  process.exitCode = 1;
} else {
  console.log("\n✅ Safe to ship (no open P0 failures).");
  process.exitCode = 0;
}
