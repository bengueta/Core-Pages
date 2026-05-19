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

Push ל-`main` מפעיל את [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

**פעם אחת בהגדרות הריפו:** Settings → Pages → Build and deployment → **Source: GitHub Actions**.
