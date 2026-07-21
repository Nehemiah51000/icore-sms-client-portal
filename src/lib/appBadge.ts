// The Badging API is still experimental and not yet in TypeScript's
// standard lib.dom types, so we describe just the two methods we need.
interface NavigatorWithBadging extends Navigator {
  setAppBadge?: (count: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
}

// Badging API — puts a small unread-count dot on the installed PWA's home
// screen icon. Only does anything once the app is actually installed;
// silently no-ops in a regular browser tab or on unsupported browsers.
export function updateAppBadge(count: number) {
  const nav = navigator as NavigatorWithBadging;
  if (!nav.setAppBadge || !nav.clearAppBadge) return;

  try {
    if (count > 0) {
      nav.setAppBadge(count);
    } else {
      nav.clearAppBadge();
    }
  } catch {
    // Non-critical — ignore.
  }
}
