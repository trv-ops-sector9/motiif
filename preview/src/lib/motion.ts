/** Read a CSS duration token (e.g. "400ms") from the active motion theme. */
export function cssMs(token: string, fallback = 400): number {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  if (v.endsWith("ms")) return parseFloat(v);
  if (v.endsWith("s"))  return parseFloat(v) * 1000;
  return fallback;
}

/** Read a CSS easing token (e.g. "cubic-bezier(...)") from the active motion theme. */
export function cssCurve(token: string, fallback = "ease-out"): any {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim() || fallback;
}
