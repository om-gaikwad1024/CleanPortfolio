"use client";

import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { useLenis } from "lenis/react";
import { setNavigationTarget } from "@/lib/navigation";

type ScrollLinkProps = ComponentPropsWithoutRef<"a"> & { href: string };

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// In-page link that glides to its #target through Lenis instead of jumping.
// Longer trips take a little longer, so they never feel like a jump.
export default function ScrollLink({ href, onClick, ...rest }: ScrollLinkProps) {
  const lenis = useLenis();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || !lenis || !href.startsWith("#")) return;

    const target = document.querySelector<HTMLElement>(href);
    if (!target) return; // no such section: let the browser handle it

    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY;
    const distance = Math.abs(y - window.scrollY);
    const duration = Math.min(1.2 + distance / 6000, 2.4);
    setNavigationTarget(y);
    // Cleared on arrival, or after the trip's time if the user interrupts it.
    window.setTimeout(() => setNavigationTarget(null), duration * 1000 + 300);
    lenis.scrollTo(target, {
      duration,
      easing: easeInOutCubic,
      force: true,
      onComplete: () => setNavigationTarget(null),
    });
    history.pushState(null, "", href);
  };

  return <a href={href} onClick={handleClick} {...rest} />;
}
