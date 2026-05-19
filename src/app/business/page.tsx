import type { Metadata } from "next";
import { BusinessCalcShell } from "@/features/tools/business/BusinessCalcShell";

export const metadata: Metadata = {
  title: "מחשבון עסק",
  description: "מחשבון להערכת חבילות לפי גודל עסק, סוג שירות ורמת ליווי.",
};

export default function BusinessCalculatorPage() {
  return <BusinessCalcShell />;
}
