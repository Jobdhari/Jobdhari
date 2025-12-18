// scripts/generate-feature-map.mjs
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const OUT_DIR = path.join(ROOT, "docs");
const OUT_FILE = path.join(OUT_DIR, "FEATURE_MAP.md");

const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  "out",
  "coverage",
]);

const ALLOWED_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

// ---------- helpers ----------
function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function walk(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const e of entries) {
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      results.push(...walk(path.join(dir, e.name)));
      continue;
    }

    const ext = path.extname(e.name);
    if (!ALLOWED_EXT.has(ext)) continue;

    results.push(path.join(dir, e.name));
  }
  return results;
}

function rel(p) {
  return path.relative(ROOT, p).replaceAll("\\", "/");
}

// ---------- feature block parsing ----------
function extractFeatureBlocks(code) {
  const blocks = [];
  const re = /\/\*\*[\s\S]*?\*\//g;
  const matches = code.match(re) || [];
  for (const block of matches) {
    if (block.includes("@feature")) blocks.push(block);
  }
  return blocks;
}

function parseBlock(block) {
  const grab = (tag) => {
    const re = new RegExp(`@${tag}\\s+(.+)`, "i");
    const m = block.match(re);
    return m ? m[1].trim() : "";
  };

  const feature = grab("feature");
  if (!feature) return null;

  return {
    feature,
    responsibility: grab("responsibility"),
    routes: grab("routes"),
    usedBy: grab("usedBy"),
  };
}

// ---------- exports ----------
function extractExports(code) {
  const out = [];

  const fnRe = /export\s+async\s+function\s+([A-Za-z0-9_]+)/g;
  const fnRe2 = /export\s+function\s+([A-Za-z0-9_]+)/g;
  const constRe = /export\s+const\s+([A-Za-z0-9_]+)/g;
  const typeRe = /export\s+type\s+([A-Za-z0-9_]+)/g;
  const ifaceRe = /export\s+interface\s+([A-Za-z0-9_]+)/g;

  let m;
  for (const re of [fnRe, fnRe2, constRe, typeRe, ifaceRe]) {
    while ((m = re.exec(code))) out.push(m[1]);
  }

  return Array.from(new Set(out)).sort();
}

// ---------- classification ----------
function classifyFile(filePath) {
  const p = rel(filePath);
  if (p.startsWith("src/app/") && p.endsWith("/page.tsx")) return "Page";
  if (p.includes("/components/")) return "Component";
  if (p.includes("/lib/firebase/")) return "Firebase Service";
  if (p.includes("/lib/")) return "Library";
  return "Other";
}

// ---------- route detection (FIXED) ----------
function routeFromAppPage(relPath) {
  // relPath example: src/app/jobs/[id]/page.tsx OR src/app/page.tsx
  let inside = relPath.replace(/^src\/app\//, "");

  // root: src/app/page.tsx
  if (inside === "page.tsx") return "/";

  // nested: jobs/page.tsx, jobs/[id]/page.tsx
  inside = inside.replace(/\/page\.tsx$/, "");
  return "/" + inside;
}

// ---------- Firestore collection detection ----------
function extractFirestoreCollections(code) {
  const names = new Set();
  const re = /collection\s*\(\s*[^,]+,\s*["'`]([^"'`]+)["'`]\s*\)/g;
  let m;
  while ((m = re.exec(code))) names.add(m[1]);
  return Array.from(names).sort();
}

// ---------- main ----------
function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error("❌ src/ not found. Run from project root.");
    process.exit(1);
  }

  const files = walk(SRC_DIR);

  const features = new Map();
  const inventory = [];
  const routes = [];
  const collectionsIndex = new Map();

  for (const file of files) {
    const code = safeRead(file);
    if (!code) continue;

    const kind = classifyFile(file);
    const exports = extractExports(code);
    const relFile = rel(file);

    inventory.push({ file: relFile, kind, exports });

    // ✅ FIXED ROUTE COLLECTION
    if (kind === "Page" && relFile.endsWith("/page.tsx")) {
      routes.push({ route: routeFromAppPage(relFile), file: relFile });
    }

    const cols = extractFirestoreCollections(code);
    for (const c of cols) {
      if (!collectionsIndex.has(c)) collectionsIndex.set(c, new Set());
      collectionsIndex.get(c).add(relFile);
    }

    const blocks = extractFeatureBlocks(code);
    for (const b of blocks) {
      const parsed = parseBlock(b);
      if (!parsed) continue;

      const entry = {
        file: relFile,
        kind,
        responsibility: parsed.responsibility,
        routes: parsed.routes,
        usedBy: parsed.usedBy,
        exports,
      };

      if (!features.has(parsed.feature)) features.set(parsed.feature, []);
      features.get(parsed.feature).push(entry);
    }
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const lines = [];
  lines.push(`# JobDhari Feature Map (Auto-Generated)`);
  lines.push(``);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(``);
  lines.push(`> Generated by \`npm run docs:featuremap\`.`);
  lines.push(`> Do not manually edit sections below—edit code annotations instead.`);
  lines.push(``);

  // ---------- Features ----------
  lines.push(`## Features (from @feature annotations)`);
  lines.push(``);

  const featureNames = Array.from(features.keys()).sort((a, b) =>
    a.localeCompare(b)
  );

  if (featureNames.length === 0) {
    lines.push(`⚠️ No \`@feature\` annotations found yet.`);
    lines.push(``);
  } else {
    for (const name of featureNames) {
      lines.push(`### ${name}`);
      lines.push(``);
      const entries = features.get(name) || [];
      for (const e of entries) {
        lines.push(`- **${e.kind}**: \`${e.file}\``);
        if (e.responsibility) lines.push(`  - Responsibility: ${e.responsibility}`);
        if (e.routes) lines.push(`  - Routes: ${e.routes}`);
        if (e.usedBy) lines.push(`  - Used by: ${e.usedBy}`);
        if (e.exports?.length) {
          lines.push(
            `  - Exports: ${e.exports.map((x) => `\`${x}\``).join(", ")}`
          );
        }
      }
      lines.push(``);
    }
  }

  // ---------- Routes ----------
  lines.push(`## Routes Map (auto-detected from src/app/.../page.tsx)`);
  lines.push(``);
  routes.sort((a, b) => a.route.localeCompare(b.route));
  for (const r of routes) {
    lines.push(`- \`${r.route}\` → \`${r.file}\``);
  }
  lines.push(``);

  // ---------- Firestore ----------
  lines.push(`## Firestore Collections (auto-detected)`);
  lines.push(``);
  const colNames = Array.from(collectionsIndex.keys()).sort((a, b) =>
    a.localeCompare(b)
  );
  if (colNames.length === 0) {
    lines.push(`(No Firestore collections detected.)`);
    lines.push(``);
  } else {
    for (const c of colNames) {
      lines.push(`### ${c}`);
      for (const f of Array.from(collectionsIndex.get(c)).sort()) {
        lines.push(`- \`${f}\``);
      }
      lines.push(``);
    }
  }

  // ---------- Inventory ----------
  lines.push(`## File Inventory (high-level)`);
  lines.push(``);
  const byKind = new Map();
  for (const item of inventory) {
    if (!byKind.has(item.kind)) byKind.set(item.kind, []);
    byKind.get(item.kind).push(item);
  }

  for (const [kind, items] of Array.from(byKind.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    lines.push(`### ${kind}`);
    lines.push(``);
    for (const it of items.sort((a, b) => a.file.localeCompare(b.file))) {
      lines.push(
        `- \`${it.file}\`${it.exports.length ? ` — ${it.exports.map((x) => `\`${x}\``).join(", ")}` : ""}`
      );
    }
    lines.push(``);
  }

  fs.writeFileSync(OUT_FILE, lines.join("\n"), "utf8");
  console.log(`✅ Generated: ${rel(OUT_FILE)}`);
}

main();
