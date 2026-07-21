// Badging API — puts a small unread-count dot on the installed PWA's home
// screen icon. Only does anything once the app is actually installed;
// silently no-ops in a regular browser tab or on unsupported browsers.
export function updateAppBadge(count: number) {
  if (!('setAppBadge' in navigator)) return;
  try {
    if (count > 0) {
      (navigator as unknown).setAppBadge(count);
    } else {
      (navigator as unknown).clearAppBadge();
    }
  } catch {
    // Non-critical — ignore.
  }
}
