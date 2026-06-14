# Vault MDX isolation checklist (GitHub Pages / Core-Pages)

Use this when changing **`vault/`** in Core-Pages or verifying separation from [CoreStrategy](https://github.com/bengueta/Core-Pages) (Vercel + Convex — different trust zone).

## What “fully disconnected” means

| Check | Detail |
|-------|--------|
| **App code** | CoreStrategy **`src/`** must **not** import vault code, hold Convex for MDX Vault, or proxy to Vault via API routes. |
| **Constants** | CoreStrategy `src/lib/routes/tools.ts` may link to `TOOL_ROUTES.vault` (external URL only). |
| **CI in CoreStrategy** | Only `deploy.yml` and `test.yml` — **no** GitHub Pages deploy for Vault in that repo. |
| **Secrets** | Doppler → Vercel/Convex stays in **CoreStrategy**. Core-Pages vault build uses **GitHub-hosted** vars/secrets (optional **OIDC** to Pages). |

## Secure defaults on GitHub (this repo)

1. **Actions → General**: restrict fork PR workflows; read-only tokens for forks if PR CI runs on `vault/`.
2. **Pages**: source = **GitHub Actions** only.
3. **Environment `github-pages`**: optional protection before production deploy.
4. **Secrets**: Giscus IDs as **Secrets**, not plaintext in MDX.
5. **Branch protection**: PR review + passing vault CI before merge to `main`.
6. **Dependabot**: enable for `vault/package.json`.

## Operational URLs

- **Tools index:** [https://bengueta.github.io/Core-Pages/](https://bengueta.github.io/Core-Pages/)
- **Vault:** [https://bengueta.github.io/Core-Pages/vault/](https://bengueta.github.io/Core-Pages/vault/)

Verify deploys at [github.com/bengueta/Core-Pages/actions](https://github.com/bengueta/Core-Pages/actions).
