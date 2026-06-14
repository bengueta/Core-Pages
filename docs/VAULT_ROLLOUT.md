# Vault MDX — rollout on Core-Pages (GitHub only)

**Related:** policy [VAULT_PAGES.md](./VAULT_PAGES.md). Source: [`vault/`](../vault/).

Deploy and rollback happen **only** in this repository. CoreStrategy/Vercel is **not** involved.

## Target URL

**[https://bengueta.github.io/Core-Pages/vault/](https://bengueta.github.io/Core-Pages/vault/)**

## Rollout checklist (maintainers)

| Step | Action |
|------|--------|
| 1 | Edit MDX under `vault/src/content/vault/` via PR |
| 2 | `pnpm run validate` + `pnpm run build` in `vault/` (CI runs on merge) |
| 3 | GitHub Pages source = Actions; `BASE_PATH` set in deploy workflow |
| 4 | Actions `vars` / `secrets` for `PUBLIC_SITE_URL`, `BASE_PATH`, optional Giscus |
| 5 | Forum: GitHub Discussions — see [vault/DISCUSSIONS_AND_GISCUS.md](../vault/DISCUSSIONS_AND_GISCUS.md) |

## Rollback

- Revert the last merge on `main`, or disable vault deploy steps in `.github/workflows/deploy-pages.yml`.
- No Vercel or Doppler rollback — the product site is unchanged.

## What we intentionally do **not** do

- No Convex or Doppler secrets in this build.
- No `NEXT_PUBLIC_*` Vault URL on CoreStrategy Vercel (external link only).
