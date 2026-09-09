import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HotPots | AI-assisted road defect review",
  description: "A transparent, human-in-the-loop prototype for road defect triage.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
