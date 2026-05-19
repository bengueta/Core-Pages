# Core-Pages

כלים סטטיים: **מחשבון עסק** ו-**בונה צבעים / טוקנים** — ללא שרת, DB או התחברות.

## אתר חי (GitHub Pages)

| כלי | כתובת |
|-----|--------|
| רשימת כלים | https://bengueta.github.io/Core-Pages/ |
| מחשבון עסק | https://bengueta.github.io/Core-Pages/business/ |
| צבעים וטוקנים | https://bengueta.github.io/Core-Pages/brand-colors/ |

## פיתוח מקומי

```bash
pnpm install
pnpm run dev
```

http://localhost:3020 — בלי `basePath` (נתיבים בשורש).

## Build כמו ב-GitHub Pages

```bash
pnpm run build:pages
```

פלט: `out/` עם `basePath` של `/Core-Pages`.

## פריסה

Push ל-`main` מפעיל את [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) — בונה ודוחף לענף `gh-pages`.

### דרישות

1. הריפו **Public** (חינם) — כבר בוצע.
2. Push ל-`main` מעדכן את ענף **`gh-pages`** (האתר הסטטי).
3. **חובה פעם אחת:** [הפעלת Pages](docs/ENABLE_GITHUB_PAGES.md) — Settings → **Deploy from a branch** → `gh-pages` / `(root)` → Save.

> אזהרת Node.js ב-Actions לא גורמת ל-404.
