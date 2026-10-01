"use client";

import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { useLenis } from "lenis/react";

type ScrollLinkProps = ComponentPropsWithoutRef<"a"> & { href: string };

// In-page link that scrolls to its #target through Lenis instead of jumping.
export default function ScrollLink({ href, onClick, ...rest }: ScrollLinkProps) {
  const lenis = useLenis();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || !lenis || !href.startsWith("#")) return;

    const target = document.querySelector<HTMLElement>(href);
    if (!target) return; // no such section: let the browser handle it

    e.preventDefault();
    lenis.scrollTo(target);
    history.pushState(null, "", href);
  };

  return <a href={href} onClick={handleClick} {...rest} />;
}
