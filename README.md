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

**פעם אחת** ([Settings → Pages](https://github.com/bengueta/Core-Pages/settings/pages)):

1. **Build and deployment → Source:** `Deploy from a branch`
2. **Branch:** `gh-pages` · **Folder:** `/ (root)`
3. Save

> אם קודם ניסית **GitHub Actions** כ-Source וקיבלת 404 — החלף ל-**Deploy from a branch** כמו למעלה. ה-workflow לא משתמש ב-`deploy-pages@v4`.
