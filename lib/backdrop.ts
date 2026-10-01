import { useSyncExternalStore } from "react";

// Whether the black backdrop fully covers the orb (so the orb can stop rendering).

let opaque = false;
const listeners = new Set<() => void>();

export function setBackdropOpaque(value: boolean) {
  if (value === opaque) return;
  opaque = value;
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useBackdropOpaque(): boolean {
  return useSyncExternalStore(subscribe, () => opaque, () => false);
}
