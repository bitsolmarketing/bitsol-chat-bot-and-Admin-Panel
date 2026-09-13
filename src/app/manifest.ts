import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brands";
import { SEO } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} AI Concierge`,
    short_name: "BITSOL AI",
    description: SEO.homeDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#050816",
    theme_color: "#050816",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
