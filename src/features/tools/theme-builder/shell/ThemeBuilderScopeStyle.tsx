"use client";

import type { ThemeBuilderState } from "../types";

/** Global preview + token chrome injected once under `#theme-builder`. */
export function ThemeBuilderScopeStyle({ appBgStyle }: Pick<ThemeBuilderState, "appBgStyle">) {
  return (
    <style>{`
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(201,169,110,.3)} 50%{box-shadow:0 0 0 4px rgba(201,169,110,0)} }
        #theme-builder input[type=range]{-webkit-appearance:none;background:rgba(255,255,255,.06);border-radius:99px;height:3px;outline:none}
        #theme-builder input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:#c9a96e;cursor:pointer;border:2px solid #09090b}
        #theme-builder *::-webkit-scrollbar{width:3px}
        #theme-builder *::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:99px}
        #theme-builder *::-webkit-scrollbar-track{background:transparent}

        #theme-builder .preview-wrapper::before {
          content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
          opacity: ${appBgStyle === "grain" ? 1 : 0}; transition: opacity 0.3s;
        }

        #theme-builder .t-heading, [data-theme-builder-scope] .t-heading { font-size: 9px; font-weight: 600; letter-spacing: .05em; color: var(--c-muted-fg); text-transform: uppercase; opacity: 0.7; margin-bottom: 8px; }

        #theme-builder .t-card, [data-theme-builder-scope] .t-card {
          background: var(--card-bg); backdrop-filter: var(--card-backdrop); -webkit-backdrop-filter: var(--card-backdrop);
          border: var(--card-border); border-radius: var(--radius); box-shadow: var(--shadow-actual);
          transition: transform var(--transition) var(--easing), box-shadow var(--transition) var(--easing), border-color var(--transition);
          position: relative;
        }
        #theme-builder .t-card:hover, [data-theme-builder-scope] .t-card:hover {
          transform: translateY(calc(var(--spacing) * -2px));
          box-shadow: 0 12px 30px -10px color-mix(in srgb, var(--c-fg) 20%, transparent), var(--shadow-actual);
        }

        #theme-builder .t-input, [data-theme-builder-scope] .t-input {
          padding: calc(8px * var(--spacing)) calc(12px * var(--spacing));
          font-size: 13px; color: var(--c-fg); outline: none; width: 100%;
          font-family: var(--font-body); box-sizing: border-box;
          background: var(--card-bg); backdrop-filter: var(--card-backdrop); -webkit-backdrop-filter: var(--card-backdrop);
          border: var(--card-border); border-radius: var(--radius);
          box-shadow: inset 0 1px 2px rgba(0,0,0,.05); transition: border-color var(--transition);
        }
        #theme-builder .t-input:focus, [data-theme-builder-scope] .t-input:focus { border-color: var(--c-primary); }

        #theme-builder .t-btn, [data-theme-builder-scope] .t-btn { transition: all var(--transition) var(--easing); }
        #theme-builder .t-btn:hover, [data-theme-builder-scope] .t-btn:hover { filter: brightness(1.1) saturate(1.1); transform: translateY(-1px); }
        #theme-builder .t-btn:active, [data-theme-builder-scope] .t-btn:active { filter: brightness(0.9); transform: translateY(1px); }

        #theme-builder .t-table, [data-theme-builder-scope] .t-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
        #theme-builder .t-table th, [data-theme-builder-scope] .t-table th { text-align: left; padding: 8px 16px; font-weight: 600; color: var(--c-muted-fg); border-bottom: 1px solid color-mix(in srgb, var(--c-border) 50%, transparent); font-size: 10px; }
        #theme-builder .t-table td, [data-theme-builder-scope] .t-table td { padding: 8px 16px; border-bottom: 1px solid color-mix(in srgb, var(--c-border) 20%, transparent); color: var(--c-fg); font-weight: 500; }
        #theme-builder .t-table td:nth-child(2), [data-theme-builder-scope] .t-table td:nth-child(2) { color: var(--c-muted-fg); font-weight: 400; }
        #theme-builder .t-table tr:nth-child(even), [data-theme-builder-scope] .t-table tr:nth-child(even) { background: color-mix(in srgb, var(--c-muted) 15%, transparent); }

        #theme-builder .t-badge, [data-theme-builder-scope] .t-badge { display: inline-flex; padding: 2px 8px; font-size: 10px; font-weight: 600; border-radius: var(--radius); }

        @keyframes t-ref-skel-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.92; } }
        #theme-builder .t-ref-skeleton, [data-theme-builder-scope] .t-ref-skeleton {
          background: color-mix(in srgb, var(--c-muted) 80%, var(--c-border));
          animation: t-ref-skel-pulse 1.35s ease-in-out infinite;
        }
      `}</style>
  );
}
