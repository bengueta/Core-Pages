import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

/**
 * GitHub Pages project site URL is https://<owner>.github.io/<repo>/ — set BASE_PATH=/repo-name/
 * Local dev: leave unset (base "/").
 * PUBLIC_SITE_URL: full origin for canonical/sitemap generation (example: https://bengueta.github.io)
 */
function normalizeBase(raw) {
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return "/";
  }
  let s = String(raw).trim().replaceAll("\\", "/");
  if (!s.startsWith("/")) s = `/${s}`;
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

const basePath = normalizeBase(process.env.BASE_PATH);
const site = process.env.PUBLIC_SITE_URL ?? "http://localhost:4322";

export default defineConfig({
  site,
  base: basePath === "/" ? undefined : basePath,
  trailingSlash: "always",
  integrations: [mdx()],
  // Isolation: inline (empty) PostCSS config so the Astro build never climbs to a
  // parent postcss.config.* (e.g. Core-Pages' Tailwind config when this lives at
  // Core-Pages/vault/). Keeps the vault build fully self-contained.
  vite: { css: { postcss: { plugins: [] } } },
});
