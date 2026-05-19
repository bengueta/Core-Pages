export type ThemeMode = "light" | "dark";

export type ThemeBuilderTab = "presets" | "palette" | "type" | "layout" | "effects" | "themes";
export type ExportFormat = "css" | "tailwind" | "json" | "pack";
export type ViewportMode = "desktop" | "tablet" | "mobile";

export type UserPreset = {
  id: string;
  name: string;
  savedAt: string;
  state: ThemeBuilderState;
};

export type ThemeBuilderState = {
  colors: Record<string, string>;
  mode: ThemeMode;

  fontHeading: string;
  fontBody: string;
  fontMono: string;
  fontWeight: { heading: number; body: number };
  typeScale: string;
  lineHeight: number;
  letterSpacing: number;

  radius: string;
  shadow: string;
  spacing: number;
  containerWidth: number;
  borderWidth: number;
  borderStyle: string;
  transition: string;
  animEasing: string;

  wrapperStyle: "none" | "floating" | "card";
  appBgStyle: "solid" | "mesh" | "grain";
  cardStyle: "flat" | "glass" | "gradient";
  shadowType: "soft" | "hard" | "neon";
  buttonTransform: "none" | "uppercase";

  pattern: string;
  patternOpacity: number;
  patternSize: number;

  glass: { blur: number; opacity: number; border: number; saturation: number };
  glow: { color: string; intensity: number };

  themeStyle: string;
};

