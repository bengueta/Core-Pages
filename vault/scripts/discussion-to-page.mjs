/**
 * A2 pipeline core: turn a GitHub Discussion into a static block page.
 *
 * Runs inside GitHub Actions (on: discussion). Reads the discussion body, extracts
 * the ```json block produced by the public builder, VALIDATES + SANITIZES it (this
 * is untrusted public input), and writes vault/src/content/pages/<slug>.json.
 * The deploy workflow then rebuilds Pages.
 *
 * Local test:
 *   DISCUSSION_NUMBER=99 DISCUSSION_TITLE="Demo" \
 *   DISCUSSION_BODY='```json\n{"title":"Demo","blocks":[...]}\n```' \
 *   node scripts/discussion-to-page.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const VALID_TYPES = new Set([
  "hero", "imageText", "quote", "cta", "spacer", "divider", "heading", "text",
  "stats", "alert", "list", "video", "twoCta", "faq", "iconFeature", "checklist",
  "pricing", "timeline", "embed", "callout", "personCard", "codeSnippet", "progressBar",
]);
/** props that hold URLs — only http(s)/relative/anchor allowed (block javascript:, data:, …) */
const URL_PROPS = new Set(["imageUrl", "buttonHref", "button1Href", "button2Href", "videoUrl", "embedUrl"]);
const MAX_BLOCKS = 60;
const MAX_STR = 5000;

const number = process.env.DISCUSSION_NUMBER;
const evtTitle = (process.env.DISCUSSION_TITLE || "").slice(0, 200);
const body = process.env.DISCUSSION_BODY || "";
const author = (process.env.DISCUSSION_AUTHOR || "").slice(0, 100);

if (!number) { console.error("Missing DISCUSSION_NUMBER"); process.exit(1); }

const m = body.match(/```json\s*([\s\S]*?)```/);
if (!m) { console.log("No ```json block in discussion body — nothing to publish."); process.exit(0); }

let data;
try { data = JSON.parse(m[1]); } catch (e) { console.error("Invalid JSON in discussion:", e.message); process.exit(1); }

function safeUrl(v) {
  if (typeof v !== "string") return "";
  const s = v.trim();
  if (/^https?:\/\//i.test(s)) return s;          // absolute web link
  if (/^(\/|\.\.?\/|#)/.test(s)) return s;        // relative path / anchor
  return "";                                       // strip everything else (javascript:, data:, …)
}
const clampStr = (v) => (typeof v === "string" ? v.slice(0, MAX_STR) : v);

function sanitizeProps(props) {
  if (!props || typeof props !== "object" || Array.isArray(props)) return {};
  const out = {};
  for (const [k, v] of Object.entries(props)) {
    if (URL_PROPS.has(k)) out[k] = safeUrl(v);
    else if (typeof v === "string") out[k] = clampStr(v);
    else if (typeof v === "number" || typeof v === "boolean") out[k] = v;
    // drop objects/arrays/functions in props — block props are flat primitives
  }
  return out;
}

const blocks = (Array.isArray(data.blocks) ? data.blocks.slice(0, MAX_BLOCKS) : [])
  .filter((b) => b && typeof b.type === "string" && VALID_TYPES.has(b.type))
  .map((b) => ({ type: b.type, props: sanitizeProps(b.props) }));

if (blocks.length === 0) { console.error("No valid blocks after sanitizing — aborting."); process.exit(1); }

const palettes = {};
if (data.palettes && typeof data.palettes === "object") {
  for (const [pid, roles] of Object.entries(data.palettes)) {
    if (roles && typeof roles === "object" && !Array.isArray(roles)) {
      const r = {};
      for (const [role, color] of Object.entries(roles)) {
        if (typeof color === "string" && /^[a-z0-9_-]+$/i.test(color)) r[role] = color;
      }
      if (Object.keys(r).length) palettes[String(pid).slice(0, 40)] = r;
    }
  }
}

const pageTitle = (typeof data.title === "string" && data.title.trim())
  ? data.title.trim().slice(0, 200)
  : (evtTitle || `עמוד ${number}`);
const titleSlug = (pageTitle.toLowerCase().match(/[a-z0-9]+/g) || []).join("-").slice(0, 40);
const slug = `${titleSlug || "page"}-${number}`; // discussion number = uniqueness, no overwrite of others

const page = {
  title: pageTitle,
  ...(typeof data.summary === "string" && data.summary.trim() ? { summary: data.summary.trim().slice(0, 300) } : {}),
  slug,
  updated: new Date().toISOString().slice(0, 10),
  ...(author ? { author } : {}),
  blocks,
  ...(Object.keys(palettes).length ? { palettes } : {}),
};

const pagesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "content", "pages");
mkdirSync(pagesDir, { recursive: true });
const file = join(pagesDir, `${slug}.json`);
writeFileSync(file, JSON.stringify(page, null, 2) + "\n");
console.log(`Wrote ${file} — ${blocks.length} block(s), slug "${slug}".`);
