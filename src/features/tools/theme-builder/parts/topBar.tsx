"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  Download,
  Hexagon,
  Monitor,
  Moon,
  PanelLeft,
  PanelLeftClose,
  Pipette,
  Smartphone,
  Sun,
  Tablet,
} from "lucide-react";

import type { ThemeBuilderState, ViewportMode } from "../types";
import { ThemeBuilderA11y } from "./ThemeBuilderA11y";
import { Divider, ToolBtn } from "./chrome";
import type { ContrastStatus } from "../tools/contrast/contrastStatus";

export function TopBar({
  state,
  panelOpen,
  setPanelOpen,
  pickMode,
  setPickMode,
  contrastOpen,
  setContrastOpen,
  contrastStatus,
  onAutoFg,
  autoFgUndoAvailable,
  onUndoAutoFg,
  onOpenExportPack,
  viewport,
  setViewport,
  upd,
}: {
  state: ThemeBuilderState;
  panelOpen: boolean;
  setPanelOpen: Dispatch<SetStateAction<boolean>>;
  pickMode: boolean;
  setPickMode: Dispatch<SetStateAction<boolean>>;
  contrastOpen: boolean;
  setContrastOpen: Dispatch<SetStateAction<boolean>>;
  contrastStatus: ContrastStatus;
  onAutoFg: () => void;
  autoFgUndoAvailable: boolean;
  onUndoAutoFg: () => void;
  onOpenExportPack: () => void;
  viewport: ViewportMode;
  setViewport: Dispatch<SetStateAction<ViewportMode>>;
  upd: (path: string, value: unknown) => void;
}) {
  return (
    <>
      <div
        className="flex items-center gap-1.5 px-2.5 flex-shrink-0"
        style={{
          height: 42,
          background: "rgba(9,9,11,.94)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,.06)",
          zIndex: 60,
        }}
      >
        <ToolBtn icon={panelOpen ? PanelLeftClose : PanelLeft} active={panelOpen} onClick={() => setPanelOpen((v) => !v)} />
        <div className="w-5 h-5 rounded flex-shrink-0 grid place-items-center" style={{ background: "linear-gradient(135deg,#c9a96e,#b8944f)" }}>
          <Hexagon size={9} color="#09090b" fill="#09090b" />
        </div>
        <span
          style={{
            fontFamily: "'DM Serif Display',serif",
            fontSize: 13,
            opacity: 0.85,
            flex: 1,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          Brand colors & tokens
        </span>

        <Divider />
        <ToolBtn icon={Pipette} active={pickMode} pulse onClick={() => setPickMode((v) => !v)} title="Pick element" />
        <ToolBtn icon={Download} title="Export Pack" onClick={onOpenExportPack} />

        <ThemeBuilderA11y
          open={contrastOpen}
          onOpenChange={setContrastOpen}
          contrastStatus={contrastStatus}
          onAutoFg={onAutoFg}
          onUndoAutoFg={onUndoAutoFg}
          autoFgUndoAvailable={autoFgUndoAvailable}
        />
        <Divider />
        {[
          { k: "desktop", I: Monitor },
          { k: "tablet", I: Tablet },
          { k: "mobile", I: Smartphone },
        ].map(({ k, I }) => (
          <ToolBtn key={k} icon={I} active={viewport === (k as ViewportMode)} onClick={() => setViewport(k as ViewportMode)} />
        ))}
        <Divider />

        <div className="flex overflow-hidden rounded-md flex-shrink-0" style={{ border: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.03)" }}>
          {[
            { m: "light", I: Sun },
            { m: "dark", I: Moon },
          ].map(({ m, I }) => (
            <button
              key={m}
              onClick={() => upd("mode", m)}
              className="flex items-center gap-1 px-2 py-1 transition-colors cursor-pointer hover:bg-white/10"
              style={{
                fontSize: 10,
                fontWeight: 500,
                background: state.mode === m ? "rgba(255,255,255,.08)" : "transparent",
                color: state.mode === m ? "#e4e4e7" : "rgba(228,228,231,.3)",
              }}
            >
              <I size={10} />
              {m === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>

      </div>
    </>
  );
}
