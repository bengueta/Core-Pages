# CoreStrategy Tools (סטטי)

מחשבון עסק + בונה צבעים/טוקנים — **ללא** Convex, auth או DB.  
פריסה: אתר סטטי (`output: "export"`) → תיקיית `out/`.

## פיתוח מקומי

```bash
pnpm install
pnpm run dev
```

פתיחה: [http://localhost:3020](http://localhost:3020)

## Build

```bash
pnpm run build
```

הפלט: `out/` — להעלות ל-Cloudflare Pages / GitHub Pages / Netlify.

## פריסה ל-GitHub + Cloudflare Pages

1. ב-GitHub: **New repository** → שם למשל `corestrategy-tools` (public).
2. מהתיקייה הזו:

```bash
git init
git add .
git commit -m "Initial static tools site"
git branch -M main
git remote add origin https://github.com/YOUR_USER/corestrategy-tools.git
git push -u origin main
```

3. [Cloudflare Pages](https://pages.cloudflare.com/) → Create project → Connect repo:
   - Build command: `pnpm run build`
   - Build output directory: `out`
   - Node: 22

4. קישור מהאתר הראשי ל-`https://<project>.pages.dev/business` וכו'.

## נתיבים

| נתיב | כלי |
|------|-----|
| `/` | רשימת כלים |
| `/business` | מחשבון עסק |
| `/brand-colors` | Theme Builder |
