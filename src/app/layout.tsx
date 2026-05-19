import type { Metadata } from "next";
import { AppThemeProvider } from "@/components/providers/AppThemeProvider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "כלים ומערכות | CoreStrategy",
    template: "%s | CoreStrategy Tools",
  },
  description: "מחשבון עסק ובונה צבעים וטוקנים — כלים סטטיים.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <AppThemeProvider>
          <main className="flex min-h-screen min-w-0 w-full flex-1 flex-col">
            {children}
          </main>
        </AppThemeProvider>
      </body>
    </html>
  );
}
