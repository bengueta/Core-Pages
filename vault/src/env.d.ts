/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Full origin for canonical/sitemap, e.g. https://bengueta.github.io */
  readonly PUBLIC_SITE_URL?: string;
  /** GitHub repo URL backing the forum, e.g. https://github.com/bengueta/Core-Pages */
  readonly PUBLIC_GITHUB_REPO_URL?: string;
  /** Giscus: "owner/repo" */
  readonly PUBLIC_GISCUS_REPO?: string;
  /** Giscus: public repo id (NOT a secret) */
  readonly PUBLIC_GISCUS_REPO_ID?: string;
  /** Giscus: category name */
  readonly PUBLIC_GISCUS_CATEGORY?: string;
  /** Giscus: public category id (NOT a secret) */
  readonly PUBLIC_GISCUS_CATEGORY_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
