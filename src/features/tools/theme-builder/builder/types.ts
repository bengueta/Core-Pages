import type { Dispatch, ReactNode, SetStateAction } from "react";

import type { ThemeBuilderState, ThemeBuilderTab, ViewportMode } from "../types";

import type { BlockType } from "./blockCatalog";

export type { BlockType };

export type CanvasBlock = {
  id: string;
  type: BlockType;
  visible: boolean;
  order: number;
};

export type BlockRenderProps = {
  state: ThemeBuilderState;
  viewport: ViewportMode;
  pickMode: boolean;
  setTab: Dispatch<SetStateAction<ThemeBuilderTab>>;
  setPanelOpen: Dispatch<SetStateAction<boolean>>;
};

export type BlockRegistryEntry = {
  type: BlockType;
  label: string;
  group: "layout" | "data" | "commerce" | "forms" | "actions" | "content";
  defaultSpan?: "full" | "auto";
  render: (props: BlockRenderProps) => ReactNode;
};
