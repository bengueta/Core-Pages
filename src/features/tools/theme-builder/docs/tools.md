## Theme Builder — Top Bar tools

This feature adds **3 small tools** to the Theme Builder Top Bar (next to Pick Mode).

### 1) Contrast (popover)
- **UI**: A popover listing fixed pairs (no DOM scan) with ratio and PASS/FAIL.
- **Code**:
  - 	ools/contrast/contrast.ts: pure math (contrastRatio)
  - 	ools/contrast/contrastPairs.ts: CONTRAST_PAIRS
  - 	ools/contrast/ContrastPopover.tsx: popover UI (close on outside click + Esc)

### 2) Auto-FG (one-click + undo)
- **Behavior**: changes only primaryFg, secondaryFg, ccentFg, cardFg.
- **Undo**: stores a snapshot of state.colors only.
- **Code**:
  - 	ools/auto-fg/autoFg.ts: utoGenerateForegrounds, pickReadableFg

### 3) Export Pack (tab inside Export modal)
- **UI**: Export modal gets a pack tab that exposes **3 quick-copy outputs**:
  - CSS variables
  - Tailwind snippet
  - tokens.json
- **Code**:
  - 	ools/export-pack/exportPack.ts: generateExportPack
  - ExportModal.tsx: renders pack UI + copy buttons
