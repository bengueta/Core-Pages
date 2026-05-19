"use client";

import { getBlockEntry } from "../builder";
import type { BlockRenderProps, CanvasBlock } from "../builder/types";

export function StaticReferenceBlock({
  block,
  renderProps,
  visible = true,
}: {
  block: CanvasBlock;
  renderProps: BlockRenderProps;
  visible?: boolean;
}) {
  const entry = getBlockEntry(block.type);
  return (
    <div className="relative min-h-[40px] rounded-lg">
      {visible && entry ? (
        entry.render(renderProps)
      ) : (
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded"
          style={{ background: "rgba(255,255,255,.04)", fontSize: 10, color: "rgba(228,228,231,.4)" }}
        >
          <span style={{ fontStyle: "italic" }}>{entry?.label ?? block.type} (hidden)</span>
        </div>
      )}
    </div>
  );
}
