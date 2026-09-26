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
    default: "traceturn — deterministic forensics for AI agent swarms",
    template: "%s · traceturn",
  },
  description:
    "Reconstruct the turn a swarm incident started in, and trace how a single unverified premise became consensus. Deterministic graph analysis over multi-agent transcripts — no LLM in the attribution path.",
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
    title: "traceturn — deterministic forensics for AI agent swarms",
    description:
      "Blame the turn. Trace the belief. Deterministic graph analysis over multi-agent transcripts.",
    siteName: "traceturn",
  },
  twitter: {
    card: "summary_large_image",
    title: "traceturn — deterministic forensics for AI agent swarms",
    description:
      "Blame the turn. Trace the belief. Deterministic graph analysis over multi-agent transcripts.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#08090a",
  colorScheme: "dark" as const,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--fg)]">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
