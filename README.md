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

### חובה — אחרת כל הקישורים 404

1. **הריפו חייב להיות Public** (בחשבון חינם, GitHub Pages לא מפרסם אתר ציבורי מריפו Private).  
   [Settings → General → Danger zone → Change visibility → Public](https://github.com/bengueta/Core-Pages/settings)

2. **הפעלת Pages** ([Settings → Pages](https://github.com/bengueta/Core-Pages/settings/pages)):
   - **Source:** `Deploy from a branch`
   - **Branch:** `gh-pages` · **Folder:** `/ (root)`
   - Save — המתן 1–3 דקות

3. בדוק: https://bengueta.github.io/Core-Pages/

> אזהרת Node.js 20 ב-Actions **לא** גורמת ל-404 — אפשר להתעלם בינתיים.
