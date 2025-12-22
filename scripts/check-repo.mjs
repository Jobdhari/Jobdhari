import { spawnSync } from "node:child_process";

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: "inherit", shell: true });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

run("node", ["scripts/check-open-failures.mjs"]);
run("node", ["scripts/check-dev-failure-links.mjs"]);
run("node", ["scripts/check-featuremap-stale.mjs"]);
