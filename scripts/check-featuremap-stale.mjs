import fs from "node:fs";
import path from "node:path";

const SRC_DIR = path.join(process.cwd(), "src");
const MAP = path.join(process.cwd(), "docs", "FEATURE_MAP.md");

function latestMtime(dir) {
  let latest = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (["node_modules", ".next", ".git"].includes(e.name)) continue;
      latest = Math.max(latest, latestMtime(p));
    } else {
      const stat = fs.statSync(p);
      latest = Math.max(latest, stat.mtimeMs);
    }
  }
  return latest;
}

if (!fs.existsSync(MAP)) {
  console.log("⛔ docs/FEATURE_MAP.md missing. Run: npm run docs:featuremap");
  process.exit(1);
}

const srcLatest = latestMtime(SRC_DIR);
const mapMtime = fs.statSync(MAP).mtimeMs;

if (srcLatest > mapMtime) {
  console.log("⛔ FEATURE_MAP.md is stale (src changed after it was generated).");
  console.log("Run: npm run docs:featuremap");
  process.exit(1);
}

console.log("✅ Feature map freshness check: OK");
