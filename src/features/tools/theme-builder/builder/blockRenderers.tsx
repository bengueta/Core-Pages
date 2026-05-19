"use client";

import type { ComponentType, ReactNode } from "react";

import { AlertBannersBlock } from "../reference/blocks/AlertBannersBlock";
import { ArticleTeaserBlock } from "../reference/blocks/ArticleTeaserBlock";
import { ButtonsBlock } from "../reference/blocks/ButtonsBlock";
import { FeatureListBlock } from "../reference/blocks/FeatureListBlock";
import { FormBlock } from "../reference/blocks/FormBlock";
import { HeroBlock } from "../reference/blocks/HeroBlock";
import { LoadingStateBlock } from "../reference/blocks/LoadingStateBlock";
import { NavBlock } from "../reference/blocks/NavBlock";
import { OfferCardBlock } from "../reference/blocks/OfferCardBlock";
import { PricingBlock } from "../reference/blocks/PricingBlock";
import { ProgressMetricsBlock } from "../reference/blocks/ProgressMetricsBlock";
import { StatsBlock } from "../reference/blocks/StatsBlock";
import { StatusBadgesBlock } from "../reference/blocks/StatusBadgesBlock";
import { TableBlock } from "../reference/blocks/TableBlock";
import { TeamStatusBlock } from "../reference/blocks/TeamStatusBlock";

import { PREVIEW_BLOCK_CATALOG, type BlockType } from "./blockCatalog";
import type { BlockRegistryEntry, BlockRenderProps, CanvasBlock } from "./types";

function preview(Comp: ComponentType<object>) {
  const Preview = () => <Comp />;
  Preview.displayName = `Preview(${Comp.displayName ?? Comp.name ?? "Block"})`;
  return Preview;
}

/** Exhaustive: every `BlockType` maps to a render (TypeScript enforces). */
export const blockRenderers: { [K in BlockType]: (props: BlockRenderProps) => ReactNode } = {
  nav: ({ viewport }) => <NavBlock viewport={viewport} />,
  hero: ({ state }) => <HeroBlock state={state} />,
  stats: preview(StatsBlock),
  offerCard: preview(OfferCardBlock),
  pricing: preview(PricingBlock),
  buttons: preview(ButtonsBlock),
  form: preview(FormBlock),
  table: preview(TableBlock),
  articleTeaser: preview(ArticleTeaserBlock),
  featureList: preview(FeatureListBlock),
  statusBadges: preview(StatusBadgesBlock),
  progressMetrics: preview(ProgressMetricsBlock),
  teamStatus: preview(TeamStatusBlock),
  loadingState: preview(LoadingStateBlock),
  alertBanners: preview(AlertBannersBlock),
};

/** Metadata from `blockCatalog` + `blockRenderers` — single place for builder preview. */
export const BLOCK_REGISTRY: BlockRegistryEntry[] = PREVIEW_BLOCK_CATALOG.map((def) => ({
  type: def.type,
  label: def.label,
  group: def.group,
  ...("defaultSpan" in def ? { defaultSpan: def.defaultSpan } : {}),
  render: blockRenderers[def.type],
}));

export function getBlockEntry(type: CanvasBlock["type"]): BlockRegistryEntry | undefined {
  return BLOCK_REGISTRY.find((b) => b.type === type);
}
