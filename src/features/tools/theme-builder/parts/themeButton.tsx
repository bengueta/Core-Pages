"use client";

import { ReferenceButton, type ReferenceButtonProps } from "../reference/core";

/** Builder-panel alias: `de` maps to preview `data-e` (same as `ReferenceButton` `dataE`). */
export type BtnProps = Omit<ReferenceButtonProps, "dataE" | "tokenTarget"> & { de?: string };

export function Btn({ de, ...rest }: BtnProps) {
  return <ReferenceButton dataE={de} {...rest} />;
}
