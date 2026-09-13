import type { Metadata } from "next";

/** The sign-in page is for staff only and must stay out of search results. */
export const metadata: Metadata = {
  title: "Staff sign in",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
