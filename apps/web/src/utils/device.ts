// Minimal type for the User-Agent Client Hints API, which not all browsers implement.
interface NavigatorWithUaData extends Navigator {
  userAgentData?: { platform?: string };
}

// True only for Android browsers, never iOS or desktop. Prefers the
// User-Agent Client Hints platform when available, falling back to the UA string.
export const isAndroidBrowser = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const uaData = (navigator as NavigatorWithUaData).userAgentData;
  if (uaData?.platform) return uaData.platform.toLowerCase() === "android";
  return /Android/i.test(navigator.userAgent);
};
