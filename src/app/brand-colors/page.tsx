import type { Metadata } from "next";
import { ThemeBuilderClient } from "@/features/tools";

export const metadata: Metadata = {
  title: "צבעים וטוקנים",
  description:
    "פלטת צבעים, טוקני עיצוב, ניגודיות וייצוא — ללא חיבור לשרת.",
};

export default function BrandColorsPage() {
  return <ThemeBuilderClient />;
}
