# Vault MDX (Core-Pages)

Portable **Astro + MDX** site with a **GitHub-native community layer**: `/forum/` (GitHub Discussions) plus optional per-article comments (Giscus). No backend, no database, no secrets — fully isolated from CoreStrategy.

**Live:** [https://bengueta.github.io/Core-Pages/vault/](https://bengueta.github.io/Core-Pages/vault/)

## Docs

| Doc | Purpose |
|-----|---------|
| [../docs/VAULT_PAGES.md](../docs/VAULT_PAGES.md) | Trust boundaries and architecture |
| [../docs/VAULT_ISOLATION_CHECKLIST.md](../docs/VAULT_ISOLATION_CHECKLIST.md) | Separation from CoreStrategy |
| [../docs/VAULT_ROLLOUT.md](../docs/VAULT_ROLLOUT.md) | Deploy and rollback |
| [INTEGRATE_CORE_PAGES.md](./INTEGRATE_CORE_PAGES.md) | CI wiring |
| [DISCUSSIONS_AND_GISCUS.md](./DISCUSSIONS_AND_GISCUS.md) | Forum and comments |

## Local dev

```bash
cd vault
pnpm install --frozen-lockfile
pnpm run dev
```

```bash
pnpm run validate
pnpm run build
```

## Governance

[GOVERNANCE.md](./GOVERNANCE.md) · [CONTRIBUTING.md](./CONTRIBUTING.md)
