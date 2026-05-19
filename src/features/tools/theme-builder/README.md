# Theme Builder (כלים — מבודד תחת `/tools/brand-colors`)

This feature is intentionally **isolated** under `/tools/brand-colors` and must **not** leak UI or CSS into the main site.

## Canonical block source

**`builder/blockCatalog.ts`** is the single source of truth for preview blocks:

- `PREVIEW_BLOCK_CATALOG` — `type`, `label`, `group`, optional `defaultSpan`
- Derived: `PREVIEW_SITE_BLOCK_ORDER`, `PREVIEW_SITE_BLOCK_LABELS`, `BlockType`

`reference/preview/pageBlueprint.ts` re-exports order/labels from `blockCatalog` and builds default canvas rows. **`builder/templates/basic.ts`** maps the same order into the “Basic” template. **`builder/blockRenderers.tsx`** (single module) contains the exhaustive `blockRenderers` map, **`BLOCK_REGISTRY`**, and **`getBlockEntry`**. **`builder/types.ts`** re-exports `BlockType` from `blockCatalog`.

If you add or reorder a block, start in `blockCatalog.ts`, then extend `blockRenderers.tsx` (see recipe). Metadata stays in `blockCatalog.ts` so server code can import order/labels without pulling the client block map.

## Folder map

| Path | Role |
|------|------|
| `ThemeBuilderShell.tsx` | Orchestrator: state, persistence, callbacks |
| `ThemeBuilderParts.tsx` | Thin composition entry (tabs / chrome / preview) |
| `parts/` | Split UI: `chrome`, `tabs`, `topBar`, `sidebar`, `previewContent`, `panelControls`, `themeButton` |
| `types.ts` | Theme builder state, tabs, viewport |
| `config.ts` | Static options, presets metadata, tabs config |
| `lib.ts` | `buildCssVars`, export, preset helpers, storage-related logic |
| `ExportModal.tsx` | Export UI (`getExport` callback) |
| `builder/blockCatalog.ts` | **Canonical** block metadata: `type`, `label`, `group`, optional `defaultSpan` (no React; safe for server imports) |
| `builder/blockRenderers.tsx` | **Single module:** exhaustive `blockRenderers`, `BLOCK_REGISTRY`, `getBlockEntry` (imports `reference/blocks/*`) |
| `builder/types.ts` | `CanvasBlock`, `BlockRegistryEntry`, `BlockRenderProps`; exports `BlockType` |
| `builder/templates/basic.ts` | Basic template rows from `PREVIEW_SITE_BLOCK_ORDER` |
| `reference/preview/` | `pageBlueprint`, `PreviewSiteShell`, preview composition |
| `reference/blocks/` | One file per preview block; **import from `../core`** (barrel) for primitives + chrome |
| `reference/core/index.ts` | **Public barrel** — re-exports all preview primitives, `getReferenceRootStyle`, `RefCard` / `RefBlockTitle`, `refTypo`, layout helpers |
| `reference/core/previewChrome.tsx` | Client: `RefBlockTitle`, `RefCard` |
| `reference/core/previewTokens.ts` | RSC-safe: `refTypo`, `refFlexCol`, `refFlexRowWrap` |
| `reference/core/referenceButtonStyles.ts` | Shared button appearance tokens for `ReferenceButton` |
| `tools/` | Contrast, auto-fg, export-pack helpers used inside the feature |

## `reference/core` primitives

Shared, preview-only building blocks (shadcn-inspired **structure** only; styling uses `--c-*`, `--radius`, `--shadow-actual`, `--font-*` as elsewhere):

- `ReferenceButton` — primary CTA styling + `data-e` for pick mode
- `ReferenceAlert` — banner variants (info / success / warning / destructive)
- `ReferenceBadge` — pill / status chip
- `ReferenceProgress` — track (`muted`) + fill (`primary` / `secondary` / `accent`) with matching `data-e` for pick mode
- `ReferenceAvatar` — initials / image placeholder
- `ReferenceSkeleton` — loading placeholders
- `ReferenceSeparator` — horizontal rule using border tokens

Do **not** import `components/ui` or app Tailwind into `reference/`; the preview must stay aligned with `buildCssVars`.

## Recipe: add a new preview block

1. **Catalog** — Append an entry to `PREVIEW_BLOCK_CATALOG` in `builder/blockCatalog.ts` (`type`, `label`, `group`, optional `defaultSpan`). `BlockType` updates automatically.
2. **Component** — Add `reference/blocks/YourBlock.tsx` with `import { … } from "../core"` and inline `var(--c-*)` where needed.
3. **Render map** — In `blockRenderers.tsx`, add a `BlockType` key to `blockRenderers` and use `preview(YourBlock)` if the block takes no props (TypeScript will error if you miss a `BlockType`). `BLOCK_REGISTRY` updates from the same file.
4. **Verify** — `basic.ts` and `pageBlueprint` already follow `PREVIEW_SITE_BLOCK_ORDER` from the catalog; no duplicate list edits needed unless you introduce a non-default template.

## File responsibilities (keep Cursor edits clean)

- `types.ts` (root): theme builder state shape only.
- `config.ts`: static data (options, built-in presets, tabs).
- `lib.ts`: css vars, export, preset normalization, helpers.
- `ThemeBuilderParts.tsx` + `parts/`: UI composition only.

## Non-negotiables

- Preview/layout CSS is scoped to **`#theme-builder`** and **`[data-theme-builder-scope]`** (see injected `<style>` in `ThemeBuilderShell.tsx`); keep new selectors aligned with those scopes.
- Presets are the source of truth for saving (no heavy auto-save on every change).
- No `from "@/components/ui/..."` under `reference/` — document-only mention in this README is allowed for the rule itself.
