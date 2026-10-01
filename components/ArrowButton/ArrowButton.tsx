import type { ComponentPropsWithoutRef } from "react";
import styles from "./ArrowButton.module.css";

type AnchorProps = ComponentPropsWithoutRef<"a"> & { href: string };
type ButtonProps = ComponentPropsWithoutRef<"button"> & { href?: undefined };
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

const withRoot = (className?: string) =>
  className ? `${styles.root} ${className}` : styles.root;

// Pill button whose accent dot expands on hover. Renders <a> when given href, otherwise <button>.
export default function ArrowButton(props: ArrowButtonProps) {
  if (props.href !== undefined) {
    const { className, children, ...rest } = props;
    return (
      <a className={withRoot(className)} {...rest}>
        <Fill />
        {children}
      </a>
    );
  }

  const { className, children, type = "button", ...rest } = props;
  return (
    <button type={type} className={withRoot(className)} {...rest}>
      <Fill />
      {children}
    </button>
  );
}
