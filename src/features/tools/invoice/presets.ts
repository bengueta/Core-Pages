"use client";

/**
 * Reusable per-block presets — the user saves a block's settings under a name
 * and re-applies them to any block of the same type later. Stored locally.
 */

import type { Block, BlockSpan, BlockType, InvoiceDoc } from "./engine";

export const PRESETS_KEY = "tool_invoice_block_presets";

/** Block types where a named preset is genuinely useful (reusable content). */
export const PRESET_TYPES: BlockType[] = ["brand", "text", "heading", "bullets", "terms", "keyvalue", "footer", "notes", "payment", "signature"];

export type BlockPreset = { id: string; name: string; data: Record<string, unknown> };
export type PresetStore = Partial<Record<BlockType, BlockPreset[]>>;

export function supportsPreset(type: BlockType): boolean {
  return PRESET_TYPES.includes(type);
}

/** Snapshot the meaningful, reusable fields for a block (some live on the doc). */
export function capturePreset(block: Block, doc: InvoiceDoc): Record<string, unknown> {
  switch (block.type) {
    case "brand":
      return { bizName: doc.bizName, bizId: doc.bizId, bizAddr: doc.bizAddr, bizPhone: doc.bizPhone, bizEmail: doc.bizEmail, logoAssetId: doc.logoAssetId, align: block.align ?? "right", span: block.span };
    case "text":
    case "heading":
    case "bullets":
    case "terms":
    case "keyvalue":
    case "footer":
      return { title: block.title ?? "", body: block.body ?? "", align: block.align ?? "right", span: block.span };
    case "notes":
      return { notes: doc.notes };
    case "payment":
      return { payInfo: doc.payInfo };
    case "signature":
      return {
        sigMode: block.sigMode ?? "business",
        title: block.title ?? "",
        signerName: block.signerName ?? "",
        align: block.align ?? "right",
        intent: block.intent ?? "",
        signatureAssetId: block.signatureAssetId ?? null,
      };
    default:
      return {};
  }
}

/** Turn a saved preset back into patches for the block and/or the document. */
export function applyPreset(type: BlockType, data: Record<string, unknown>): { blockPatch?: Partial<Block>; docPatch?: Partial<InvoiceDoc> } {
  switch (type) {
    case "brand":
      return {
        docPatch: {
          bizName: String(data.bizName ?? ""),
          bizId: String(data.bizId ?? ""),
          bizAddr: String(data.bizAddr ?? ""),
          bizPhone: String(data.bizPhone ?? ""),
          bizEmail: String(data.bizEmail ?? ""),
          logoAssetId: (data.logoAssetId as string | null) ?? null,
        },
        blockPatch: { align: (data.align as Block["align"]) ?? "right", span: (data.span as BlockSpan) ?? 1 },
      };
    case "text":
    case "heading":
    case "bullets":
    case "terms":
    case "keyvalue":
    case "footer":
      return {
        blockPatch: {
          title: String(data.title ?? ""),
          body: String(data.body ?? ""),
          align: (data.align as Block["align"]) ?? "right",
          span: (data.span as BlockSpan) ?? 2,
        },
      };
    case "notes":
      return { docPatch: { notes: String(data.notes ?? "") } };
    case "payment":
      return { docPatch: { payInfo: String(data.payInfo ?? "") } };
    case "signature":
      return {
        blockPatch: {
          sigMode: (data.sigMode as Block["sigMode"]) ?? "business",
          title: String(data.title ?? ""),
          signerName: String(data.signerName ?? ""),
          align: (data.align as Block["align"]) ?? "right",
          intent: String(data.intent ?? ""),
          signatureAssetId: (data.signatureAssetId as string | null) ?? null,
        },
      };
    default:
      return {};
  }
}
