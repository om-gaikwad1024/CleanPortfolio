// Where an in-page link scroll is heading (page Y), while it's in progress.
// Lets sections avoid hijacking a scroll that is just passing through them.

let destination: number | null = null;

export function setNavigationTarget(y: number | null) {
  destination = y;
}

export function navigationTarget(): number | null {
  return destination;
}
