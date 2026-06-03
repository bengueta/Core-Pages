import type { Metadata } from "next";
import { InvoiceShell } from "@/features/tools/invoice/InvoiceShell";

export const metadata: Metadata = {
  title: "הצעת מחיר / חשבונית",
  description: "מחולל הצעות מחיר וחשבוניות מעוצבות עם מע״מ והדפסה ל-PDF — ללא שרת.",
};

export default function QuotePage() {
  return <InvoiceShell />;
}
