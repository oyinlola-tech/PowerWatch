import * as Location from "expo-location";

export interface ExactLocation {
  latitude: number;
  longitude: number;
  /** Accuracy radius in metres, when the device reports it */
  accuracy?: number;
}

export type LocationResult =
  | { ok: true; location: ExactLocation }
  | { ok: false; reason: "denied" | "unavailable" };

const FIX_TIMEOUT_MS = 10_000;

/**
 * Asks for foreground location permission (once) and returns a fresh, high-accuracy
 * fix. Falls back to the last known position if a fresh fix takes too long.
 */
export const getExactLocation = async (): Promise<LocationResult> => {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return { ok: false, reason: "denied" };

    const fresh = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), FIX_TIMEOUT_MS));
    const position = (await Promise.race([fresh, timeout])) ?? (await Location.getLastKnownPositionAsync());
    if (!position) return { ok: false, reason: "unavailable" };

    return {
      ok: true,
      location: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        ...(position.coords.accuracy != null ? { accuracy: position.coords.accuracy } : {}),
      },
    };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
};
