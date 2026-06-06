# Core-Pages

אוסף **כלים ומערכות** סטטיים המתארחים ב-GitHub Pages — ללא שרת משלנו, ללא DB, ללא תשתית בתשלום.

- **כלים סטטיים (חסרי-מצב):** מחשבון עסק · בונה צבעים/טוקנים · הצעת מחיר/חשבונית
- **THE VAULT:** מערכת תוכן וקהילה — ספריית מאמרים, פורום, ו**בונה עמודים (בלוקים)** שכל אחד מפרסם דרך חשבון ה-GitHub שלו. **100% GitHub-native, בלי backend.**

## אתר חי (GitHub Pages)

| יעד | כתובת |
|-----|--------|
| רשימת הכלים | https://bengueta.github.io/Core-Pages/ |
| מחשבון עסק | https://bengueta.github.io/Core-Pages/business/ |
| צבעים וטוקנים | https://bengueta.github.io/Core-Pages/brand-colors/ |
| הצעת מחיר / חשבונית | https://bengueta.github.io/Core-Pages/quote/ |
| **THE VAULT** | https://bengueta.github.io/Core-Pages/vault/ |
| · פורום | https://bengueta.github.io/Core-Pages/vault/forum/ |
| · בונה עמודים (סטודיו) | https://bengueta.github.io/Core-Pages/vault/build/ |
| · עמוד שנבנה | `https://bengueta.github.io/Core-Pages/vault/p/<slug>/` |

---

## THE VAULT

מערכת תוכן וקהילה עצמאית תחת `vault/` — אפליקציית **Astro** סטטית, **מבודדת לחלוטין** מאפליקציית ה-Next של Core-Pages: אין Convex, אין DB, אין secrets בבאנדל. הקישור היחיד מדף הבית הוא `<a>` רגיל.

### מה יש בה
- **ספרייה** (`/vault/`) — מאמרי MDX (`vault/src/content/vault/*.mdx`).
- **פורום** (`/vault/forum/`) — מבוסס GitHub Discussions; מתחברים עם חשבון GitHub וכותבים.
- **בונה עמודים / סטודיו** (`/vault/build/`) — עורך גרירה עם **23 בלוקים** (טקסט, וידאו, קוד, תמחור, סטטיסטיקות, ציר-זמן…), פלטות צבעים, אנימציות, ותצוגה חיה לכל מכשיר. **פתוח לכולם.**
- **עמודי בלוקים** (`/vault/p/<slug>/`) — נבנים מקובצי JSON (`vault/src/content/pages/*.json`).
- **תגובות** (אופציונלי) — Giscus מתחת לכל מאמר.

### איך פרסום עובד (GitHub-native, בלי שרת)
1. משתמש בונה עמוד בסטודיו ולוחץ **"פרסם"**.
2. נפתח **GitHub Discussion ממולא** בקטגוריית **`Pages`** — המשתמש מאשר תוך התחברות GitHub שלו. *(משתמש אף פעם לא מקבל הרשאת כתיבה ל-repo.)*
3. ה-Action [`.github/workflows/process-pages.yml`](.github/workflows/process-pages.yml) (`on: discussion`) מריץ את [`vault/scripts/discussion-to-page.mjs`](vault/scripts/discussion-to-page.mjs) — **מאמת ומנקה** את ה-JSON (זורק בלוקים לא חוקיים, חוסם `javascript:`/`data:`, מגביל גודל), כותב `vault/src/content/pages/<slug>.json` ודוחף.
4. הדחיפה מפעילה את ה-deploy → העמוד עולה ב-`/vault/p/<slug>/`.

### הקמה (חד-פעמי, למתחזק)
1. **Discussions** מופעל, עם קטגוריה בשם **`Pages`** (פורמט *Open-ended*) — שם נוצרים עמודים שמשתמשים מפרסמים.
2. ה-Action [`process-pages.yml`](.github/workflows/process-pages.yml) מותקן (תבנית מקור: [`vault/process-pages.workflow.example.yml`](vault/process-pages.workflow.example.yml)).
3. *(אופציונלי)* פורום/תגובות Giscus: ראו [`vault/DISCUSSIONS_AND_GISCUS.md`](vault/DISCUSSIONS_AND_GISCUS.md).

### קוד
- `vault/` — אפליקציית Astro עצמאית (`package.json`, `astro.config.mjs`, lockfile משלה).
- `vault/src/vault-engine/` — מנוע הבלוקים והסטודיו (`BlockRenderer`, `StudioApp`, `BlockEditor`, `PaletteEditor`, `blocks.tsx`, …).
- `vault/scripts/discussion-to-page.mjs` — ממיר Discussion → עמוד (ולידציה + סניטציה).
- נבנה לתוך `out/vault/` ע"י [`scripts/build-pages.mjs`](scripts/build-pages.mjs) (אחרי בניית Next).

---

## פיתוח מקומי

```bash
pnpm install
pnpm run dev
```

http://localhost:3020 — בלי `basePath` (נתיבים בשורש).

הסטודיו של ה-Vault (Astro) רץ בנפרד:

```bash
pnpm -C vault install
pnpm -C vault run dev    # http://localhost:4322
```

## Build כמו ב-GitHub Pages

```bash
pnpm run build:pages
```

פלט: `out/` עם `basePath` של `/Core-Pages`. הסקריפט בונה גם את ה-Vault (Astro) לתוך `out/vault/`.

## פריסה

- Push ל-`main` → [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) בונה ודוחף לענף `gh-pages`.
- יצירת/עריכת Discussion בקטגוריית `Pages` → [`.github/workflows/process-pages.yml`](.github/workflows/process-pages.yml) מייצר עמוד ודוחף (מה שמפעיל את ה-deploy).

### דרישות

1. הריפו **Public** (חינם) — כבר בוצע.
2. Push ל-`main` מעדכן את ענף **`gh-pages`** (האתר הסטטי).
3. **חובה פעם אחת:** [הפעלת Pages](docs/ENABLE_GITHUB_PAGES.md) — Settings → **Deploy from a branch** → `gh-pages` / `(root)` → Save.

> אזהרת Node.js ב-Actions לא גורמת ל-404.
