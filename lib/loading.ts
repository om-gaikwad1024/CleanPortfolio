// Tiny readiness registry: heavy client pieces report in, the Loader waits on them.

export type LoadKey = "orb" | "carousel";

const done = new Set<LoadKey>();
const listeners = new Set<() => void>();

export function markReady(key: LoadKey) {
  if (done.has(key)) return;
  done.add(key);
  listeners.forEach((fn) => fn());
}

export function whenReady(keys: LoadKey[]): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      if (!keys.every((k) => done.has(k))) return;
      listeners.delete(check);
      resolve();
    };
    listeners.add(check);
    check();
  });
}
