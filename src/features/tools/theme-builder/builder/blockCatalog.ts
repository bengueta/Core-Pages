/**
 * Canonical preview block metadata: order, labels, grouping, and optional layout hints.
 * Registry and blueprint consume this so block lists stay in sync.
 */
export const PREVIEW_BLOCK_CATALOG = [
  { type: "nav", label: "Navigation", group: "layout" as const, defaultSpan: "full" as const },
  { type: "hero", label: "Hero", group: "layout" as const, defaultSpan: "full" as const },
  { type: "stats", label: "Stats", group: "data" as const },
  { type: "offerCard", label: "Offer card", group: "commerce" as const },
  { type: "pricing", label: "Pricing", group: "commerce" as const },
  { type: "buttons", label: "Buttons", group: "actions" as const },
  { type: "form", label: "Form", group: "forms" as const },
  { type: "table", label: "Table", group: "data" as const, defaultSpan: "full" as const },
  { type: "articleTeaser", label: "Article teaser", group: "content" as const },
  { type: "featureList", label: "Feature list", group: "content" as const },
  { type: "statusBadges", label: "Status badges", group: "content" as const },
  { type: "progressMetrics", label: "Progress metrics", group: "data" as const },
  { type: "teamStatus", label: "Team status", group: "content" as const },
  { type: "loadingState", label: "Loading state", group: "content" as const },
  { type: "alertBanners", label: "Alerts", group: "content" as const, defaultSpan: "full" as const },
] as const;

export type BlockType = (typeof PREVIEW_BLOCK_CATALOG)[number]["type"];

export const PREVIEW_SITE_BLOCK_ORDER = PREVIEW_BLOCK_CATALOG.map((b) => b.type) as readonly BlockType[];

export const PREVIEW_SITE_BLOCK_LABELS: Record<BlockType, string> = Object.fromEntries(
  PREVIEW_BLOCK_CATALOG.map((b) => [b.type, b.label]),
) as Record<BlockType, string>;
