"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

// Crossfades between routes using the browser's native View Transitions API
// instead of a hard cut. Feature-detected: browsers without support (Safari,
// Firefox as of this writing) just get a normal instant navigation.
export function TransitionLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let modified clicks behave normally
    e.preventDefault();
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      document.startViewTransition(() => router.push(href));
    } else {
      router.push(href);
    }
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
