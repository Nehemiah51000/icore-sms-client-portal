// TypeScript's lib.dom already types setAppBadge/clearAppBadge on Navigator
// (as though always present), but most real browsers don't actually
// implement the Badging API yet. This runtime check guards against calling
// something that doesn't really exist, even though TS itself is satisfied
// without one.
export function updateAppBadge(count: number) {
  if (!('setAppBadge' in navigator) || !('clearAppBadge' in navigator)) return;

  try {
    if (count > 0) {
      navigator.setAppBadge(count);
    } else {
      navigator.clearAppBadge();
    }
  } catch {
    // Non-critical — ignore.
  }
}
