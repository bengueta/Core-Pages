"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ExportFormat, ThemeBuilderState, ThemeBuilderTab, UserPreset, ViewportMode } from "../types";
import { defaultState, FONT_STACKS, PATTERNS, PRESETS, RADII, SHADOWS, THEME_CONFIGS, THEME_STYLES } from "../config";
import { buildCssVars, ensureStateFontsLoaded, generateExport, loadFont, normalizePresetState, parsePresetsStorage, serializePresetsStorage } from "../lib";
import { evaluateContrastStatus } from "../tools/contrast/contrastStatus";
import { autoGenerateForegrounds } from "../tools/auto-fg/autoFg";
import { generateExportPack } from "../tools/export-pack/exportPack";
import { getPatternOverlayStyle } from "./patternOverlayStyle";

const USER_PRESETS_KEY = "theme_builder_user_presets_v1";
const MAX_USER_PRESETS = 50;

type Notice = { id: number; kind: "success" | "error" | "info"; text: string };

/**
 * All Theme Builder state + side-effects. Keeps `ThemeBuilderShell` under the line budget.
 */
export function useThemeBuilderController() {
  const [state, setState] = useState<ThemeBuilderState>(() => defaultState());
  const [tab, setTab] = useState<ThemeBuilderTab>("presets");
  const [panelOpen, setPanelOpen] = useState(true);
  const [pickMode, setPickMode] = useState(false);
  const [paletteHighlightKey, setPaletteHighlightKey] = useState<string | null>(null);
  const [exportTab, setExportTab] = useState<ExportFormat>("css");
  const [showExport, setShowExport] = useState(false);
  const [contrastOpen, setContrastOpen] = useState(false);
  const [autoFgUndo, setAutoFgUndo] = useState<null | { colors: Record<string, string>; until: number }>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean | undefined>>({});
  const [activePreset, setActivePreset] = useState("midnight");
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [userPresets, setUserPresets] = useState<UserPreset[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const autoFgUndoTimerRef = useRef<number | null>(null);

  const notify = useCallback((kind: Notice["kind"], text: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setNotice({ id, kind, text });
    window.setTimeout(() => {
      setNotice((prev) => (prev?.id === id ? null : prev));
    }, 2600);
  }, []);

  const upd = useCallback((path: string, value: unknown) => {
    setState((prev) => {
      if (path.includes(".")) {
        const [root, leaf] = path.split(".") as [string, string];
        const rootKey = root as keyof ThemeBuilderState;
        const section = prev[rootKey];
        if (section && typeof section === "object" && !Array.isArray(section)) {
          return { ...prev, [rootKey]: { ...(section as Record<string, unknown>), [leaf]: value } } as ThemeBuilderState;
        }
        return prev;
      }
      return { ...prev, [path as keyof ThemeBuilderState]: value } as ThemeBuilderState;
    });
  }, []);

  const setColor = useCallback((key: string, value: string) => {
    setState((prev) => ({ ...prev, colors: { ...prev.colors, [key]: value } }));
  }, []);

  const applyPreset = useCallback((name: string) => {
    const p = PRESETS[name as keyof typeof PRESETS];
    if (!p) return;
    setActivePreset(name);
    setState((prev) => ({
      ...prev,
      colors: { ...prev.colors, ...p.colors },
      mode: name === "cyberpunk" ? "dark" : "light",
    }));
  }, []);

  const persistUserPresets = useCallback(
    (next: UserPreset[]) => {
      setUserPresets(next);
      try {
        localStorage.setItem(USER_PRESETS_KEY, serializePresetsStorage(next));
      } catch {
        notify("error", "Failed to save presets locally");
      }
    },
    [notify]
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_PRESETS_KEY);
      const parsed = parsePresetsStorage(raw);
      if (!parsed) return;
      setUserPresets(parsed.presets);
    } catch {
      notify("error", "Failed to load saved presets");
    }
  }, [notify]);

  const saveCurrentPreset = useCallback(
    (name: string) => {
      const cleaned = name.trim();
      if (!cleaned) {
        notify("error", "Preset name is required");
        return;
      }
      const savedAt = new Date().toISOString();
      const preset: UserPreset = { id: crypto.randomUUID(), name: cleaned, savedAt, state: normalizePresetState(state) };
      const next = [preset, ...userPresets].slice(0, MAX_USER_PRESETS);
      persistUserPresets(next);
      setActivePreset(`user:${preset.id}`);
      notify("success", "Preset saved");
    },
    [notify, persistUserPresets, state, userPresets]
  );

  const applyUserPreset = useCallback(
    (id: string) => {
      const p = userPresets.find((x) => x.id === id);
      if (!p) return;
      ensureStateFontsLoaded(p.state);
      setState(p.state);
      setActivePreset(`user:${id}`);
      notify("success", `Applied "${p.name}"`);
    },
    [notify, userPresets]
  );

  const duplicateUserPreset = useCallback(
    (id: string) => {
      const p = userPresets.find((x) => x.id === id);
      if (!p) return;
      const copy: UserPreset = {
        id: crypto.randomUUID(),
        name: `${p.name} (copy)`,
        savedAt: new Date().toISOString(),
        state: normalizePresetState(p.state),
      };
      const next = [copy, ...userPresets].slice(0, MAX_USER_PRESETS);
      persistUserPresets(next);
      setActivePreset(`user:${copy.id}`);
      notify("success", "Preset duplicated");
    },
    [notify, persistUserPresets, userPresets]
  );

  const exportUserPreset = useCallback(
    async (id: string) => {
      const p = userPresets.find((x) => x.id === id);
      if (!p) return;
      const payload = serializePresetsStorage([p]);
      try {
        await navigator.clipboard.writeText(payload);
        notify("success", `Copied "${p.name}" preset JSON`);
      } catch {
        notify("error", "Copy failed. Clipboard permission blocked.");
      }
    },
    [notify, userPresets]
  );

  const importFromJson = useCallback(
    (raw: string) => {
      try {
        const parsed = JSON.parse(raw) as unknown;
        let incoming: UserPreset[] = [];
        const versioned = parsePresetsStorage(JSON.stringify(parsed));
        if (versioned) incoming = versioned.presets;
        if (!incoming.length && Array.isArray(parsed)) {
          incoming = parsed
            .map((p) => {
              if (!p || typeof p !== "object") return null;
              const pp = p as { id?: unknown; name?: unknown; savedAt?: unknown; state?: unknown };
              if (typeof pp.name !== "string" || !pp.name.trim()) return null;
              const st = pp.state as ThemeBuilderState;
              if (!st || typeof st !== "object" || !st.colors) return null;
              return {
                id: typeof pp.id === "string" ? pp.id : crypto.randomUUID(),
                name: pp.name,
                savedAt: typeof pp.savedAt === "string" ? pp.savedAt : new Date().toISOString(),
                state: normalizePresetState(st),
              } as UserPreset;
            })
            .filter(Boolean) as UserPreset[];
        }
        if (!incoming.length && parsed && typeof parsed === "object") {
          const pp = parsed as { id?: unknown; name?: unknown; savedAt?: unknown; state?: unknown };
          if (typeof pp.name === "string" && pp.state && typeof pp.state === "object") {
            incoming = [
              {
                id: typeof pp.id === "string" ? pp.id : crypto.randomUUID(),
                name: pp.name,
                savedAt: typeof pp.savedAt === "string" ? pp.savedAt : new Date().toISOString(),
                state: normalizePresetState(pp.state as ThemeBuilderState),
              },
            ];
          }
        }
        if (!incoming.length) {
          notify("error", "Invalid preset JSON format");
          return false;
        }
        const existingIds = new Set(userPresets.map((p) => p.id));
        const mergedIncoming = incoming.map((p) => (existingIds.has(p.id) ? { ...p, id: crypto.randomUUID() } : p));
        const next = [...mergedIncoming, ...userPresets].slice(0, MAX_USER_PRESETS);
        persistUserPresets(next);
        notify("success", `Imported ${mergedIncoming.length} preset${mergedIncoming.length > 1 ? "s" : ""}`);
        return true;
      } catch {
        notify("error", "Import failed: JSON is invalid");
        return false;
      }
    },
    [notify, persistUserPresets, userPresets]
  );

  const deleteUserPreset = useCallback(
    (id: string) => {
      const deleted = userPresets.find((p) => p.id === id);
      const next = userPresets.filter((p) => p.id !== id);
      persistUserPresets(next);
      if (activePreset === `user:${id}`) setActivePreset("midnight");
      if (deleted) notify("info", `Deleted "${deleted.name}"`);
    },
    [activePreset, notify, persistUserPresets, userPresets]
  );

  const resetAll = useCallback(() => {
    setState(defaultState());
    setActivePreset("midnight");
  }, []);

  const toggleSection = useCallback((id: string) => setOpenSections((p) => ({ ...p, [id]: !p[id] })), []);

  const handlePreviewPalettePick = useCallback((key: string | null) => {
    setPaletteHighlightKey(key);
    if (key) setOpenSections((p) => ({ ...p, semantic: true }));
  }, []);

  const clearPaletteHighlight = useCallback(() => {
    setPaletteHighlightKey(null);
  }, []);

  const applyThemePreset = useCallback((key: string) => {
    setState((prev) => ({ ...prev, themeStyle: key, ...(THEME_CONFIGS[key] || THEME_CONFIGS.default) }));
  }, []);

  const randomizeAll = useCallback(() => {
    const randObjKey = (obj: Record<string, unknown>) => Object.keys(obj)[Math.floor(Math.random() * Object.keys(obj).length)];
    const randArrItem = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

    const presetKeys = Object.keys(PRESETS) as (keyof typeof PRESETS)[];
    const presetKey = randArrItem(presetKeys);
    const preset = PRESETS[presetKey];
    const newThemeStyle = randArrItem(THEME_STYLES).key;
    const randHeadFont = randArrItem(FONT_STACKS.heading);
    const randBodyFont = randArrItem(FONT_STACKS.body);
    const randMonoFont = randArrItem(FONT_STACKS.mono);

    if ("url" in randHeadFont && randHeadFont.url) loadFont(randHeadFont.url);
    if ("url" in randBodyFont && randBodyFont.url) loadFont(randBodyFont.url);
    if ("url" in randMonoFont && randMonoFont.url) loadFont(randMonoFont.url);

    setState((prev) => ({
      ...prev,
      colors: { ...prev.colors, ...preset.colors },
      mode: Math.random() > 0.5 ? "dark" : "light",
      fontHeading: randHeadFont.value,
      fontBody: randBodyFont.value,
      fontMono: randMonoFont.value,
      radius: randObjKey(RADII),
      shadow: randObjKey(SHADOWS),
      spacing: Math.round((0.8 + Math.random() * 0.6) * 100) / 100,
      borderWidth: Math.floor(Math.random() * 5),
      borderStyle: randArrItem(["solid", "solid", "solid", "dashed", "dotted"]),
      wrapperStyle: randArrItem(["none", "none", "floating", "card"]),
      pattern: randObjKey(PATTERNS),
      patternOpacity: Math.round(Math.random() * 0.2 * 100) / 100,
      patternSize: Math.floor(Math.random() * 32) + 8,
      themeStyle: newThemeStyle,
      cardStyle: randArrItem(["flat", "flat", "glass", "gradient"]),
      shadowType: randArrItem(["soft", "soft", "hard", "neon"]),
      appBgStyle: randArrItem(["solid", "solid", "mesh", "grain"]),
      buttonTransform: randArrItem(["none", "uppercase"]),
      glass: { ...prev.glass, blur: Math.floor(Math.random() * 20) + 8, opacity: Math.round((0.05 + Math.random() * 0.2) * 100) / 100 },
      glow: { ...prev.glow, intensity: Math.round((0.3 + Math.random() * 0.7) * 10) / 10 },
    }));
    setActivePreset(presetKey);
  }, []);

  const cssVars = useMemo(() => buildCssVars(state), [state]);

  const appBackgroundStyle = useMemo(() => {
    return state.appBgStyle === "mesh"
      ? `radial-gradient(at 0% 0%, color-mix(in srgb, var(--c-primary) 30%, transparent) 0px, transparent 50%),
         radial-gradient(at 100% 0%, color-mix(in srgb, var(--c-accent) 25%, transparent) 0px, transparent 50%),
         radial-gradient(at 100% 100%, color-mix(in srgb, var(--c-info) 20%, transparent) 0px, transparent 50%),
         var(--c-bg)`
      : "var(--c-bg)";
  }, [state.appBgStyle]);

  const patternBg = useMemo(() => getPatternOverlayStyle(state), [state.pattern, state.patternOpacity, state.patternSize]);

  const contrastStatus = useMemo(() => evaluateContrastStatus(state.colors, state.mode), [state.colors, state.mode]);

  const autoFgUndoAvailable = useMemo(() => {
    if (!autoFgUndo) return false;
    return Date.now() < autoFgUndo.until;
  }, [autoFgUndo]);

  const getExport = useCallback((fmt: ExportFormat) => generateExport(state, cssVars, fmt), [state, cssVars]);
  const exportPack = useMemo(() => generateExportPack(state, cssVars), [state, cssVars]);

  const clearAutoFgUndoTimer = useCallback(() => {
    if (autoFgUndoTimerRef.current !== null) {
      window.clearTimeout(autoFgUndoTimerRef.current);
      autoFgUndoTimerRef.current = null;
    }
  }, []);

  const scheduleAutoFgUndoReset = useCallback(() => {
    clearAutoFgUndoTimer();
    autoFgUndoTimerRef.current = window.setTimeout(() => {
      setAutoFgUndo(null);
      autoFgUndoTimerRef.current = null;
    }, 10_000);
  }, [clearAutoFgUndoTimer]);

  const onAutoFg = useCallback(() => {
    const patch = autoGenerateForegrounds(state.colors, state.mode);
    const hasChanges = Object.entries(patch).some(([k, v]) => state.colors[k] !== v);
    if (!hasChanges) {
      notify("info", "Auto fix found no changes needed");
      return;
    }
    setAutoFgUndo({ colors: state.colors, until: Date.now() + 10_000 });
    scheduleAutoFgUndoReset();
    setState((prev) => ({ ...prev, colors: { ...prev.colors, ...patch } }));
  }, [notify, scheduleAutoFgUndoReset, state.colors, state.mode]);

  const onUndoAutoFg = useCallback(() => {
    if (!autoFgUndo) return;
    if (Date.now() >= autoFgUndo.until) {
      setAutoFgUndo(null);
      clearAutoFgUndoTimer();
      return;
    }
    setState((prev) => ({ ...prev, colors: autoFgUndo.colors }));
    setAutoFgUndo(null);
    clearAutoFgUndoTimer();
  }, [autoFgUndo, clearAutoFgUndoTimer]);

  useEffect(() => () => clearAutoFgUndoTimer(), [clearAutoFgUndoTimer]);

  const onOpenExportPack = useCallback(() => {
    setShowExport(true);
    setExportTab("pack");
    setContrastOpen(false);
  }, []);

  const onCopyValue = useCallback(
    async (value: string, label: string) => {
      try {
        await navigator.clipboard.writeText(value);
        notify("success", `Copied ${label}`);
      } catch {
        notify("error", "Copy failed. Clipboard permission blocked.");
      }
    },
    [notify]
  );

  useEffect(() => {
    loadFont(
      "https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap"
    );
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && pickMode) {
        setPickMode(false);
        setPaletteHighlightKey(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pickMode]);

  return {
    state,
    setState,
    tab,
    setTab,
    panelOpen,
    setPanelOpen,
    pickMode,
    setPickMode,
    paletteHighlightKey,
    setPaletteHighlightKey,
    exportTab,
    setExportTab,
    showExport,
    setShowExport,
    contrastOpen,
    setContrastOpen,
    openSections,
    activePreset,
    setActivePreset,
    viewport,
    setViewport,
    userPresets,
    notice,
    notify,
    upd,
    setColor,
    applyPreset,
    persistUserPresets,
    saveCurrentPreset,
    applyUserPreset,
    duplicateUserPreset,
    exportUserPreset,
    importFromJson,
    deleteUserPreset,
    resetAll,
    toggleSection,
    handlePreviewPalettePick,
    clearPaletteHighlight,
    applyThemePreset,
    randomizeAll,
    cssVars,
    appBackgroundStyle,
    patternBg,
    contrastStatus,
    autoFgUndoAvailable,
    getExport,
    exportPack,
    onAutoFg,
    onUndoAutoFg,
    onOpenExportPack,
    onCopyValue,
  };
}
