import { spawnSync } from "node:child_process";
import { writeFileSync, existsSync, rmSync, cpSync } from "node:fs";
import { join } from "node:path";

process.env.GITHUB_PAGES = "true";

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const useShell = process.platform === "win32";
const root = process.cwd();

/** Run a command, inheriting stdio; exit the whole build on failure. */
function run(cmd, args, cwd, extraEnv = {}) {
  const res = spawnSync(cmd, args, {
    stdio: "inherit",
    cwd,
    env: { ...process.env, ...extraEnv },
    shell: useShell,
  });
  if (res.status !== 0) {
    console.error(
      `\n[build-pages] FAILED: ${cmd} ${args.join(" ")} (cwd: ${cwd})`
    );
    process.exit(res.status ?? 1);
  }
}

// 1) Next.js static export -> out/
run(pnpm, ["exec", "next", "build"], root);

// 2) Vault (Astro) sub-site -> out/vault/
//    Fully isolated, GitHub-native forum. Built as its own Astro app and dropped
//    into the Pages output under /Core-Pages/vault/. Public env only — no secrets.
const vaultDir = join(root, "vault");
if (existsSync(join(vaultDir, "package.json"))) {
  console.log("\n[build-pages] Building isolated Vault (Astro) -> out/vault/");
  const vaultEnv = {
    CI: "true",
    BASE_PATH: "/Core-Pages/vault",
    PUBLIC_SITE_URL: "https://bengueta.github.io",
    PUBLIC_GITHUB_REPO_URL: "https://github.com/bengueta/Core-Pages",
    // Giscus per-article comments (public IDs — not secrets). Threads land in the
    // dedicated "Comments" category (Announcement type: only maintainers + giscus
    // create them, visitors only comment), keeping the forum categories clean.
    PUBLIC_GISCUS_REPO: "bengueta/Core-Pages",
    PUBLIC_GISCUS_REPO_ID: "R_kgDOSiaiPA",
    PUBLIC_GISCUS_CATEGORY: "Comments",
    PUBLIC_GISCUS_CATEGORY_ID: "DIC_kwDOSiaiPM4C-fyl",
  };
  run(pnpm, ["install", "--frozen-lockfile"], vaultDir, vaultEnv);
  run(pnpm, ["run", "validate"], vaultDir, vaultEnv);
  run(pnpm, ["run", "build"], vaultDir, vaultEnv);

  const vaultDist = join(vaultDir, "dist");
  const vaultOut = join(root, "out", "vault");
  rmSync(vaultOut, { recursive: true, force: true });
  cpSync(vaultDist, vaultOut, { recursive: true });
  console.log("[build-pages] Vault copied to out/vault/");
} else {
  console.log("[build-pages] No vault/ folder found — skipping Vault build.");
}

// 3) Pages housekeeping
writeFileSync(join(root, "out", ".nojekyll"), "");
console.log("GitHub Pages build ready in out/");
