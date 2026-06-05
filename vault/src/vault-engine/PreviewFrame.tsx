"use client";

import { useState, useEffect } from "react";
import BlockRenderer from "./BlockRenderer";
import { VAULT_PREVIEW_MESSAGE_TYPE, VAULT_PREVIEW_REQUEST_TYPE } from "./lib/constants";

type VaultBlock = { type: string; props: Record<string, unknown> };

interface PreviewPayload {
  blocks: VaultBlock[];
  palettes?: Record<string, Record<string, string>>;
  title: string;
}

export default function PreviewFrame() {
  const [payload, setPayload] = useState<PreviewPayload | null>(null);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === VAULT_PREVIEW_MESSAGE_TYPE && e.data?.payload) {
        setPayload(e.data.payload);
      }
    };
    window.addEventListener("message", handler);
    if (window.parent !== window) {
      window.parent.postMessage({ type: VAULT_PREVIEW_REQUEST_TYPE }, window.location.origin);
    }
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 p-6 md:p-8" dir="rtl" data-testid="vault-preview-frame">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black mb-12 text-white">{payload?.title || "..."}</h1>
        {payload?.blocks && payload.blocks.length > 0 ? (
          <BlockRenderer
            blocks={payload.blocks}
            palettes={payload.palettes}
            onBlockSelect={(index) => {
              if (window.parent !== window) window.parent.location.hash = `block-${index}`;
            }}
          />
        ) : (
          <div className="text-center text-gray-500 py-12">אין תוכן להצגה</div>
        )}
      </div>
    </div>
  );
}
