"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

// Fades + slides a section up the first time it scrolls into view.
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  // Starts false on both server and client - IntersectionObserver is always
  // "undefined" during SSR (no browser APIs in Node), so branching the
  // initial value on its presence would mismatch on every real browser.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // Extremely unlikely target in 2026, but defer instead of setting
      // state synchronously in the effect body.
      const id = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(id);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
