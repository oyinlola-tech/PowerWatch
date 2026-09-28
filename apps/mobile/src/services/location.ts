import * as Location from "expo-location";

export interface ExactLocation {
  latitude: number;
  longitude: number;
  /** Accuracy radius in metres. The server requires this to accept a report. */
  accuracy: number;
  /** Android only: true when the position came from a mock-location app. Always false elsewhere. */
  mocked: boolean;
}

export type LocationResult =
  | { ok: true; location: ExactLocation }
  | { ok: false; reason: "denied"; canAskAgain: boolean }
  | { ok: false; reason: "unavailable" };

// A fresh fix on a phone with a weak signal can take a while; give it a real chance
// before giving up, since falling back to a stale position would misplace the report.
const FIX_TIMEOUT_MS = 20_000;

/**
 * Asks for foreground location permission and returns a fresh, high-accuracy GPS fix.
 *
 * Deliberately does NOT fall back to `getLastKnownPositionAsync`: a report always counts
 * for the neighborhood the fix resolves to, and the confirm screen shows that neighborhood
 * to the person before they submit. A stale last-known position could preview (and then
 * file) the report in the wrong place — sometimes a neighborhood away — with no way for
 * the person to tell the preview was stale. Reporting is infrequent enough that waiting
 * for a real fix is worth the accuracy; there is nothing to fall back to that is still
 * honest about where the person actually is.
 */
export const getExactLocation = async (): Promise<LocationResult> => {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return { ok: false, reason: "denied", canAskAgain: permission.canAskAgain };

    const fresh = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), FIX_TIMEOUT_MS));
    const position = await Promise.race([fresh, timeout]);
    if (!position || position.coords.accuracy == null) return { ok: false, reason: "unavailable" };

    return {
      ok: true,
      location: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        // Only Android's LocationObject reports `mocked`; iOS/web fixes are never flagged.
        mocked: position.mocked === true,
      },
    };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
};
