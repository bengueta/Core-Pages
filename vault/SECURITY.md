# Security notes (Vault MDX template)

Runs in GitHub Actions + static hosting on GitHub Pages (Core-Pages repo only).

Allowed: OIDC Pages deploy (pages: write + id-token: write) on publish job only.

Forbidden here: Doppler, Convex secrets, Vercel tokens, auth bridge to CoreStrategy.

See INTEGRATE_CORE_PAGES.md for publish merge pattern.
