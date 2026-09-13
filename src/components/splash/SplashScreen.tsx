"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogoMark } from "@/components/branding/Logo";
import { brandName } from "@/lib/branding";
import { BRAND } from "@/lib/brands";

const SEEN_KEY = "bitsol.splash.seen";

/**
 * Branded splash overlay shown on the first visit of a browser session, then
 * fades to reveal the page. Later navigations back to the landing page skip it
 * — a flourish on arrival, not a toll on every visit.
 */
export function SplashScreen({ duration = 1600 }: { duration?: number }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Storage blocked — show it, it is only a second and a half.
    }
    if (seen) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="dark brand-gradient fixed inset-0 z-[100] flex flex-col items-center justify-center text-white"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative size-24">
              <span className="absolute inset-0 animate-ping rounded-full bg-brand-cyan/15" />
              <span className="absolute -inset-6 rounded-full bg-brand-violet/25 blur-2xl" />
              <LogoMark className="relative size-full" />
            </div>

            <div className="text-center">
              <p className="text-3xl font-extrabold tracking-tight">
                BITSOL<span className="text-brand-cyan">.</span>
              </p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/50">
                {BRAND.name.replace("BITSOL ", "")}
              </p>
            </div>

            <div className="h-px w-40 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-violet"
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: duration / 1000, ease: "easeInOut" }}
              />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="absolute bottom-10 text-[11px] text-white/45"
          >
            Designed &amp; Developed by <span className="font-semibold text-white/80">{brandName}</span>
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
