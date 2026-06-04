# CLAUDE.md — note to self

## Screenshotting the tools (recipe that works in this env)

The tools render **client-side** (each shell has a `mounted` guard), so the
static `out/*.html` is just a placeholder — you **must** drive a real browser
that executes JS. Don't bother screenshotting the static export.

### Network reality (don't waste time here)
- Playwright/Chrome CDN (`cdn.playwright.dev`) → **403 "Host not in allowlist"**.
- `apt` PPAs (deadsnakes/ondrej) → **403**, so `playwright install --with-deps` fails.
- `archive.ubuntu.com` **is** reachable → `apt-get install -y poppler-utils` works.
- **A Chromium is already baked in**: `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`
  (Chromium 141). Use it directly — no download needed. There's also
  `chromium_headless_shell-1194` and `ffmpeg-1011` under `/opt/pw-browsers/`.

### Steps
```bash
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome

# 1) start dev server (port 3020) and wait until it answers
(pnpm run dev > /tmp/dev.log 2>&1 &)
for i in $(seq 1 30); do curl -sf http://localhost:3020/quote/ -o /dev/null && break; sleep 1; done

# 2) full-page PNG (desktop two-col kicks in at >=1040px; default theme is dark)
"$CHROME" --headless --no-sandbox --hide-scrollbars --force-color-profile=srgb \
  --virtual-time-budget=9000 --run-all-compositor-stages-before-draw \
  --window-size=1440,2600 --screenshot=/tmp/shot.png \
  http://localhost:3020/quote/

# 3) the ACTUAL print/PDF output (print CSS hides editor, paper goes full width)
"$CHROME" --headless --no-sandbox --virtual-time-budget=9000 \
  --print-to-pdf=/tmp/out.pdf --no-pdf-header-footer http://localhost:3020/quote/

# 4) to view a PDF inline with the Read tool, rasterize it first
apt-get install -y poppler-utils >/dev/null 2>&1
pdftoppm -png -r 130 /tmp/out.pdf /tmp/out   # -> /tmp/out-1.png
```
Then `Read` the `.png` to view it, and `SendUserFile` to deliver it.

### Gotchas
- `--virtual-time-budget` is what lets JS + framer-motion settle before capture;
  without it you can get a blank/placeholder frame.
- `--no-sandbox` is required (running as root in the container).
- The SSL handshake errors in chrome's stderr are harmless (telemetry beacons).
- **Cleanup after:** `pkill -f "next dev"`, then `git checkout -- next-env.d.ts`
  — `next dev` rewrites that file to the `./.next/dev/types/...` path; the
  committed/CI-correct path is `./.next/types/...`, so don't commit the churn.

## Project orientation
- Static-only Next 16 site → GitHub Pages (`output: "export"`, no server/DB/auth).
- Routes: `/` (tool list), `/business`, `/brand-colors`, `/quote`. Add a route by
  creating `src/app/<name>/page.tsx`, registering it in `src/lib/routes/tools.ts`,
  and adding a card in `src/features/tools/ToolsPageContent.tsx`.
- Each tool is **fully isolated** — no shared state / no cross-tool communication.
- Shared UI kit (iOS-style): `src/features/tools/shared` (`Section`, `IOSInput`,
  `SegmentedControl`, `ActionButton`, `HebrewDatePicker`, `glass`, `getTokens`, …).
- Hebrew RTL, ₪ default; default theme is **dark** (next-themes, system disabled).
- Verify with `pnpm run type-check` and `pnpm run build` before committing.
