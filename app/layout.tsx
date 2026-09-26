import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

import { JudgeHUD } from "../components/judge-hud";

export const metadata: Metadata = {
  title: "HackOps Platform",
  description: "Production-grade deterministic system tooling.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--fg)]">
        {children}
        <JudgeHUD projectName="HackOps" />
      </body>
    </html>
  );
}
