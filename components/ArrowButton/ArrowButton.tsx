import type { ComponentPropsWithoutRef } from "react";
import ScrollLink from "@/components/SmoothScroll/ScrollLink";
import styles from "./ArrowButton.module.css";

type Variant = { variant?: "solid" | "outline" };
type AnchorProps = ComponentPropsWithoutRef<"a"> & Variant & { href: string };
type ButtonProps = ComponentPropsWithoutRef<"button"> & Variant & { href?: undefined };
export type ArrowButtonProps = AnchorProps | ButtonProps;

function Fill() {
  return (
    <span className={styles.fill} aria-hidden="true">
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 12h16M14 6l6 6-6 6" />
      </svg>
    </span>
  );
}

const withRoot = (variant: Variant["variant"], className?: string) =>
  [styles.root, variant === "outline" && styles.outline, className]
    .filter(Boolean)
    .join(" ");

// Pill button whose accent dot expands on hover. Renders a link when given
// href (smooth-scrolling for #anchors), otherwise <button>.
export default function ArrowButton(props: ArrowButtonProps) {
  if (props.href !== undefined) {
    const { className, children, variant, ...rest } = props;
    // In-page links (#section) scroll smoothly through Lenis.
    const Link = rest.href.startsWith("#") ? ScrollLink : "a";
    return (
      <Link className={withRoot(variant, className)} {...rest}>
        <Fill />
        {children}
      </Link>
    );
  }

  const { className, children, variant, type = "button", ...rest } = props;
  return (
    <button type={type} className={withRoot(variant, className)} {...rest}>
      <Fill />
      {children}
    </button>
  );
}
