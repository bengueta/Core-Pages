# Integrate MDX Vault into Core-Pages

Copy this **vault-pages/** tree into the **Core-Pages** repo as **vault/** (sibling to **business/** etc.).

Deploy only from Core-Pages (GitHub Actions + GitHub Pages). CoreStrategy/Vercel never builds this.

After `pnpm run build` inside **vault/**, output is **vault/dist/**. Merge that into your existing Pages artifact so you do not overwrite **business/** or **brand-colors/**.

## Astro env (in Core-Pages Actions)

| Variable | Example | Purpose |
|---------|---------|---------|
| PUBLIC_SITE_URL | https://bengueta.github.io | canonical / sitemap origin |
| BASE_PATH or VAULT_PAGES_BASE | /Core-Pages/vault | sub-path on Pages |
| PUBLIC_GITHUB_REPO_URL | https://github.com/bengueta/Core-Pages | turns on the forum (Discussions) |
| PUBLIC_GISCUS_REPO | bengueta/Core-Pages | per-article comments (optional) |
| PUBLIC_GISCUS_REPO_ID | (public id from giscus.app) | per-article comments (optional) |
| PUBLIC_GISCUS_CATEGORY | Announcements | per-article comments (optional) |
| PUBLIC_GISCUS_CATEGORY_ID | (public id from giscus.app) | per-article comments (optional) |

Forum + comments details: [DISCUSSIONS_AND_GISCUS.md](./DISCUSSIONS_AND_GISCUS.md).

## References

- deploy-core-pages.workflow.example.yml — example workflow (standalone only).
- CONTRIBUTING.md, DISCUSSIONS_AND_GISCUS.md, GOVERNANCE.md — same folder.
