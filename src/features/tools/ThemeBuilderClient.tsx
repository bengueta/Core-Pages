"use client";

import dynamic from "next/dynamic";

const ThemeBuilderShell = dynamic(
  () => import("@/features/tools/theme-builder").then((m) => m.ThemeBuilderShell),
  { ssr: false }
);

export function ThemeBuilderClient() {
  return <ThemeBuilderShell />;
}
