# Forum & comments (GitHub-native)

The Vault has **two community layers**, both powered entirely by GitHub. The static
site stores **no users and no posts** — login, posting and moderation all happen on
GitHub. Nothing here needs a backend, a database, or a server secret.

| Layer | What it is | Where it lives |
|-------|------------|----------------|
| **Forum** | Members log in with GitHub and open/answer topics | GitHub Discussions, surfaced via the `/forum/` page |
| **Comments** | A discussion thread attached to each MDX article | Giscus widget at the bottom of every article |

## 1. Forum (Discussions)

1. In the repo: **Settings → General → Features → ✅ Discussions**.
2. Create categories. The `/forum/` cards default to GitHub's standard slugs —
   `announcements`, `q-a`, `ideas`, `show-and-tell`, `general`. Edit
   [`src/lib/forum.ts`](./src/lib/forum.ts) if your categories differ.
3. Set the repo URL at build time so the forum UI turns on:

   - `PUBLIC_GITHUB_REPO_URL` (var) — e.g. `https://github.com/bengueta/Core-Pages`

When unset, the `/forum/` page shows a "not configured" notice and the nav hides the
external Discussions link — the build still succeeds.

## 2. Comments (Giscus)

Optional per-article threads via <https://giscus.app>. Build-time vars/secrets:

| Name | Kind | Notes |
|------|------|-------|
| `PUBLIC_GISCUS_REPO` | var | `owner/repo` |
| `PUBLIC_GISCUS_REPO_ID` | var | **public** value from giscus.app (not a real secret) |
| `PUBLIC_GISCUS_CATEGORY` | var | category name, e.g. `Announcements` |
| `PUBLIC_GISCUS_CATEGORY_ID` | var | **public** value from giscus.app (not a real secret) |

> The repo-id and category-id are **public** identifiers (giscus ships them in the
> browser bundle by design). Storing them as Actions *secrets* works but is
> unnecessary — plain *variables* are fine. They are **not** write credentials.

The widget uses the `vault/<slug>` mapping. Omit the vars to disable comments.

## Security model (why this is safe on a static site)

- The bundle contains only **public** IDs and a repo URL — never a write token.
- All writes go through GitHub's own OAuth (the giscus GitHub App) and GitHub
  permissions. A static site can't hide a secret, so it holds none.
- Moderate via GitHub (lock / delete / convert / block). Revoke the giscus install
  if abused.
