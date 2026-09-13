import type { Metadata, Viewport } from "next";
// Self-hosted, so a build on a host without Google Fonts access still gets it.
import "@fontsource-variable/montserrat";
import "./globals.css";
import { BRANDING } from "@/lib/branding";
import { BRAND } from "@/lib/brands";

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} · ${BRANDING.product.name}`,
    template: `%s · ${BRAND.name}`,
  },
  description:
    "The AI concierge for BITSOL Marketing — AI chatbots, WhatsApp automation, AI agents, websites, software, digital marketing and brand. Quotes and consultations in English, Urdu, Roman Urdu or Punjabi, 24/7.",
  applicationName: BRANDING.product.name,
  authors: [{ name: BRANDING.developer.name, url: BRANDING.developer.url }],
  keywords: [
    "BITSOL",
    "BITSOL Marketing",
    "AI chatbot",
    "WhatsApp automation",
    "AI agents",
    "digital marketing",
    "SEO",
    "web development",
    "software development",
    "branding",
    "Faisalabad",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: `${BRAND.name} · ${BRANDING.product.name}`,
    description: BRAND.tagline,
    siteName: BRAND.name,
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050816",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
