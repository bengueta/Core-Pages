/**
 * Validates MDX vault frontmatter and duplicate slug rules independent of Astro.
 * Mirrors collection schema expectations in ../src/content.config.ts
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "src/content/vault");
const REQUIRED = ["title", "summary", "slug", "updated"];
const slugRe = /^[a-z0-9-]+$/;

function bail(msg) {
  console.error("[validate-content]", msg);
  process.exitCode = 1;
}

async function walkMdx(dir) {
  /** @type {string[]} */
  const out = [];
  if (!fs.existsSync(dir)) {
    bail(`Missing content directory ${dir}`);
    return out;
  }
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      out.push(...(await walkMdx(full)));
    } else if (name.name.endsWith(".mdx")) {
      out.push(full);
    }
  }
  return out;
}

const files = await walkMdx(CONTENT_DIR);

const slugToFiles = new Map();

for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  const { data } = matter(raw);
  const rel = path.relative(CONTENT_DIR, file);
  const missingField = REQUIRED.find((key) => data[key] === undefined || data[key] === null);
  if (missingField) bail(`${rel}: missing "${missingField}" in frontmatter`);
  const slugVal = typeof data.slug === "string" ? data.slug : "";
  if (!slugRe.test(slugVal))
    bail(`${rel}: slug must match lowercase [a-z0-9-] (got "${slugVal}")`);
  const existing = slugToFiles.get(slugVal) ?? [];
  existing.push(rel);
  slugToFiles.set(slugVal, existing);
}

for (const [slug, occurrences] of slugToFiles.entries()) {
  if (occurrences.length > 1)
    bail(`Duplicate slug "${slug}" in files:\n${occurrences.join("\n")}`);
}

if (process.exitCode === 1) {
  process.exit();
}

console.log("[validate-content] OK —", slugToFiles.size, "documents");
