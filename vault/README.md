# Vault MDX template (for Core-Pages only)

Portable **Astro + MDX** site with a **GitHub-native community layer**: a `/forum/`
page (GitHub Discussions — members log in with GitHub and post) plus optional
per-article comments (Giscus). No backend, no database, no secrets — fully isolated
from CoreStrategy. See [DISCUSSIONS_AND_GISCUS.md](./DISCUSSIONS_AND_GISCUS.md).

**Do not** add GitHub Actions or Vercel deploy for this folder in the CoreStrategy repo.

## Where it is deployed

1. Copy this folder into **[Core-Pages](https://github.com/bengueta/Core-Pages)** (e.g. as `vault/`).
2. Wire CI **in that repo** — see **[INTEGRATE_CORE_PAGES.md](./INTEGRATE_CORE_PAGES.md)**.
3. Optional standalone workflow example: **[deploy-core-pages.workflow.example.yml](./deploy-core-pages.workflow.example.yml)** (usually you merge `vault/dist` into your existing Pages artifact instead).

Policy and trust boundaries: [docs/VAULT_PAGES.md](../docs/VAULT_PAGES.md).

## URL (reference)

After integration on Pages: **`https://bengueta.github.io/Core-Pages/vault/`** (set Astro `BASE_PATH` in Core-Pages Actions).

CoreStrategy **intentionally** does not expose this URL in `src/lib/routes/tools.ts` — see [docs/VAULT_ISOLATION_CHECKLIST.md](../docs/VAULT_ISOLATION_CHECKLIST.md).
## Local dev

```bash
cd vault-pages
pnpm install --frozen-lockfile
pnpm run dev
```

```bash
pnpm run validate
pnpm run build
```

## Governance

[GOVERNANCE.md](./GOVERNANCE.md) · [CONTRIBUTING.md](./CONTRIBUTING.md) · [DISCUSSIONS_AND_GISCUS.md](./DISCUSSIONS_AND_GISCUS.md)

## Extract / sync

To refresh Core-Pages from CoreStrategy, copy this directory (or use `git subtree` / manual sync). Dependabot for this package runs in **Core-Pages** after you add it there — not in CoreStrategy.
