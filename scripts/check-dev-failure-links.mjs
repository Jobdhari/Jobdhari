import fs from "node:fs";

const DEV = "DEV_LOG.md";
const FAIL = "FAILURE_LOG.md";

const devHeaderRe = /^##\s+(DEV-\d{4}-\d{2}-\d{2}-\d{2})\s+—/;
const failHeaderRe = /^##\s+(FAIL-\d{4}-\d{2}-\d{2}-\d{2})\s+—/;

function readHeaders(file, re) {
  if (!fs.existsSync(file)) return new Set();
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const ids = new Set();
  for (const line of lines) {
    const m = line.match(re);
    if (m) ids.add(m[1]);
  }
  return ids;
}

const devIds = readHeaders(DEV, devHeaderRe);
const failIds = readHeaders(FAIL, failHeaderRe);

// Validate: all Fixed In: DEV-... in FAILURE_LOG exist in DEV_LOG
if (fs.existsSync(FAIL)) {
  const t = fs.readFileSync(FAIL, "utf8");
  const fixedInRe = /^\*\*Fixed In:\*\*\s+(DEV-\d{4}-\d{2}-\d{2}-\d{2})/gm;

  const missing = new Set();
  let m;
  while ((m = fixedInRe.exec(t))) {
    const devId = m[1];
    if (!devIds.has(devId)) missing.add(devId);
  }

  if (missing.size) {
    console.log("\n⛔ FAILURE_LOG.md references DEV IDs that do NOT exist in DEV_LOG.md:");
    for (const id of missing) console.log(`- ${id}`);
    process.exit(1);
  }
}

// Optional: validate "Related Failures:" references exist in FAILURE_LOG
if (fs.existsSync(DEV)) {
  const t = fs.readFileSync(DEV, "utf8");
  const relatedFailRe = /^\*\*Related Failures:\*\*\s+(.+)\s*$/gm;

  const missing = new Set();
  let m;
  while ((m = relatedFailRe.exec(t))) {
    const raw = m[1];
    const ids = raw
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    for (const id of ids) {
      if (id.startsWith("FAIL-") && !failIds.has(id)) missing.add(id);
    }
  }

  if (missing.size) {
    console.log("\n⛔ DEV_LOG.md references FAIL IDs that do NOT exist in FAILURE_LOG.md:");
    for (const id of missing) console.log(`- ${id}`);
    process.exit(1);
  }
}

console.log("✅ DEV ↔ FAIL link check: OK");
