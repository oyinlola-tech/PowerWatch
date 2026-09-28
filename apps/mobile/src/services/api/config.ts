import Constants from "expo-constants";

const DEFAULT_PORT = 3000;

/**
 * Backend base URL, e.g. https://api.powerwatch.ng.
 * Set EXPO_PUBLIC_API_URL for builds. In development it falls back to the machine
 * running the Expo dev server, so a phone on the same Wi-Fi reaches the local API.
 */
const resolveApiUrl = (): string => {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configured) {
    // Store builds must never send passwords, tokens or locations unencrypted
    // (EXPO_PUBLIC_ALLOW_INSECURE_API=1 is for test builds against a local server)
    const allowInsecure = process.env.EXPO_PUBLIC_ALLOW_INSECURE_API === "1";
    if (!__DEV__ && !allowInsecure && !configured.startsWith("https://")) {
      throw new Error("EXPO_PUBLIC_API_URL must start with https:// in release builds.");
    }
    return configured.replace(/\/+$/, "");
  }

  const devHost = Constants.expoConfig?.hostUri?.split(":")[0];
  if (devHost) return `http://${devHost}:${DEFAULT_PORT}`;

  return `http://localhost:${DEFAULT_PORT}`;
};

export const API_URL = resolveApiUrl();
export const API_PREFIX = "/api/v1";
