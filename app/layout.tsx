import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "traceturn: claim lineage for AI agent swarms",
    template: "%s · traceturn",
  },
  description:
    "Find the turn that introduced a claim and count how many agents checked it before repeating it. Deterministic analysis of multi-agent JSONL transcripts, run on the AI Village corpus. No model in the attribution path.",
  keywords: [
    "AI safety",
    "agent forensics",
    "swarm analysis",
    "incident response",
    "causal blame DAG",
    "claim lineage",
    "synthetic consensus",
  ],
  authors: [{ name: "Ayodeji Adesegun" }],
  openGraph: {
    type: "website",
    title: "traceturn: claim lineage for AI agent swarms",
    description:
      "Which agent said it first, and who checked before repeating it. Run on 183,483 AI Village messages.",
    siteName: "traceturn",
  },
  twitter: {
    card: "summary_large_image",
    title: "traceturn: claim lineage for AI agent swarms",
    description:
      "Which agent said it first, and who checked before repeating it. Run on 183,483 AI Village messages.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#100d0a",
  colorScheme: "dark" as const,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} h-full antialiased font-sans`}>
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--fg)]">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
