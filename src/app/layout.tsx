import type { Metadata, Viewport } from "next";
// Self-hosted, so a build on a host without Google Fonts access still gets it.
import "@fontsource-variable/montserrat";
import "./globals.css";
import { BRANDING } from "@/lib/branding";
import { BRAND } from "@/lib/brands";
import { SEO, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SEO.homeTitle,
    template: `%s | ${BRAND.name}`,
  },
  description: SEO.homeDescription,
  applicationName: BRANDING.product.name,
  authors: [{ name: BRANDING.developer.name, url: BRANDING.developer.url }],
  creator: BRAND.name,
  publisher: BRAND.name,
  category: "business",
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    locale: "en_PK",
    title: SEO.homeTitle,
    description: SEO.homeDescription,
  },
  // No title here: X falls back to each page's og:title, so every page keeps its own.
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#050816",
  colorScheme: "dark",
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
