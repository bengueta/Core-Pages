import { PREVIEW_SITE_BLOCK_ORDER } from "../blockCatalog";

/**
 * Preset template record — block order matches `PREVIEW_SITE_BLOCK_ORDER` from `builder/blockCatalog.ts`.
 */
export const basicTemplate = {
  id: "basic" as const,
  label: "Basic",
  blocks: PREVIEW_SITE_BLOCK_ORDER.map((type, order) => ({
    type,
    visible: true,
    order,
  })),
} as const;
