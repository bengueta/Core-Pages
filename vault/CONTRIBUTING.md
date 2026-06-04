# Contributing

There are **two ways to publish**, by design:

## 1. Post in the forum (instant, no PR)

For questions, ideas, and community discussion. Just **log in with GitHub** and open
a topic in [the forum](./src/pages/forum.astro) (GitHub Discussions). Your post
appears immediately — no review, no build. This is the path for end users.

## 2. Add a curated MDX article (Pull Request)

For lasting, reviewed knowledge-base content.

1. Add a file under `src/content/vault/` (copy `welcome.mdx`).
2. Frontmatter: `title`, `summary`, `slug` (lowercase kebab, unique), `updated`
   (`YYYY-MM-DD`), optional `draft`.
3. Open a **Pull Request**.

PR checklist:

```
pnpm install --frozen-lockfile
pnpm run validate
pnpm run build
```

After merge, GitHub Actions rebuilds and deploys.

## Security

- Do not commit secrets in Markdown.
- This template is isolated from CoreStrategy: no Convex, no Doppler, no product
  backends. Keep it that way.

Forum setup: [DISCUSSIONS_AND_GISCUS.md](./DISCUSSIONS_AND_GISCUS.md).
