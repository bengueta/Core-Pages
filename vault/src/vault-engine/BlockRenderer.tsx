"use client";

import { Component, Fragment, type ComponentType, type ErrorInfo, type ReactNode } from "react";
import { VAULT_BLOCK_COMPONENTS } from "./vaultBlockComponents";
import ScrollPreset from "./ScrollPreset";
import { paletteToCssVars } from "./lib/palette";
import type { Palette } from "./lib/palette";

type VaultBlock = { type: string; props: Record<string, unknown> };
export type PalettesMap = Record<string, Palette>;

interface BlockRendererProps {
  blocks: VaultBlock[];
  palettes?: PalettesMap;
  onBlockSelect?: (index: number) => void;
}

class BlockErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("Block error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="my-8 p-4 bg-neutral-800 rounded-lg text-gray-400 text-center">שגיאה בטעינת הבלוק</div>
      );
    }
    return this.props.children;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const BLOCKS: Record<string, ComponentType<any>> = VAULT_BLOCK_COMPONENTS as Record<string, ComponentType<any>>;
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function BlockRenderer({ blocks, palettes = {}, onBlockSelect }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return <div className="text-center text-gray-400 py-12">אין תוכן להצגה</div>;
  }

  return (
    <div className="space-y-8">
      {blocks.map((block, index) => {
        const BlockComponent = BLOCKS[block.type];
        if (!BlockComponent) {
          console.warn(`Unknown block type: ${block.type}`);
          return null;
        }
        const paletteId = typeof block.props?.paletteId === "string" ? block.props.paletteId : undefined;
        const palette = (paletteId && palettes[paletteId] ? palettes[paletteId] : undefined) as Palette | undefined;
        const animation = typeof block.props?.animation === "string" ? block.props.animation : undefined;

        const content = (
          <ScrollPreset preset={animation}>
            <BlockErrorBoundary>
              <div data-palette data-block={block.type} style={paletteToCssVars(palette) as React.CSSProperties}>
                <BlockComponent {...(block.props || {})} />
              </div>
            </BlockErrorBoundary>
          </ScrollPreset>
        );

        if (onBlockSelect) {
          return (
            <div key={index} onClick={(e) => { e.preventDefault(); onBlockSelect(index); }}
              className="cursor-pointer rounded-lg outline-2 outline-transparent transition-[outline-color] hover:outline-orange-500/30"
            >
              {content}
            </div>
          );
        }
        return <Fragment key={index}>{content}</Fragment>;
      })}
    </div>
  );
}
