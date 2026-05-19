import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

process.env.GITHUB_PAGES = "true";

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const build = spawnSync(pnpm, ["exec", "next", "build"], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

writeFileSync(join(process.cwd(), "out", ".nojekyll"), "");
console.log("GitHub Pages build ready in out/");
