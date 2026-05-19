/**
 * Preview canvas helpers. Block order and labels are defined in `builder/blockCatalog.ts`.
 */
import type { CanvasBlock } from "../../builder/types";
import { PREVIEW_SITE_BLOCK_LABELS, PREVIEW_SITE_BLOCK_ORDER } from "../../builder/blockCatalog";

export { PREVIEW_SITE_BLOCK_ORDER, PREVIEW_SITE_BLOCK_LABELS };

export type PreviewSiteBlockType = (typeof PREVIEW_SITE_BLOCK_ORDER)[number];

export function buildPreviewSiteCanvasBlocks(): CanvasBlock[] {
  return PREVIEW_SITE_BLOCK_ORDER.map((type, order) => ({
    id: `site-preview-${type}-${order}`,
    type,
    visible: true,
    order,
  }));
}
