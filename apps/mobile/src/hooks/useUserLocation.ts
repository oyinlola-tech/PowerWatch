import { useCallback, useState } from "react";
import { AppState } from "react-native";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import type { UserLocation } from "../components/map/mapHtml";

export type LocationPermissionState = "unknown" | "granted" | "denied";

export interface UserLocationState {
  /** Latest fix, or null while there is none. Private: display-only, never sent to the API. */
  position: UserLocation | null;
  permission: LocationPermissionState;
  /** False once the OS has stopped showing the permission prompt (only Settings can change it) */
  canAskAgain: boolean;
  /** Location services (GPS) are switched off on the device */
  servicesOff: boolean;
  /** Waiting for the first fix */
  locating: boolean;
  /** The first fix took too long; still watching in case one arrives */
  noFix: boolean;
  /** Asks for permission if needed, then (re)starts looking for a fix */
  request: () => Promise<LocationPermissionState>;
  /** Re-checks permission and restarts the fix, e.g. after another screen asked for permission */
  refresh: () => void;
}

// A fresh fix on a weak signal can take a while, but the map is never blocked on it
const FIX_TIMEOUT_MS = 20_000;
// Update the dot when the phone has moved this far (metres), at most every few seconds
const WATCH_DISTANCE_M = 10;
const WATCH_INTERVAL_MS = 4_000;

const toUserLocation = (position: Location.LocationObject): UserLocation => ({
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
  accuracy: position.coords.accuracy ?? 0,
});

/**
 * The phone's position for drawing a "you are here" dot on a map.
 *
 * Never prompts by itself: it only starts when permission is already granted, or after
 * `request()` (a tap on "Show my location"). It gets a fresh high-accuracy fix and then watches
 * while the screen is focused (and `enabled`), stopping when it loses focus or unmounts. A
 * mock-location fix (Android `mocked`) is shown like any other; the position is display-only
 * and must not be sent to the server.
 */
export const useUserLocation = (enabled = true): UserLocationState => {
  const [position, setPosition] = useState<UserLocation | null>(null);
  const [permission, setPermission] = useState<LocationPermissionState>("unknown");
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [servicesOff, setServicesOff] = useState(false);
  const [locating, setLocating] = useState(false);
  const [noFix, setNoFix] = useState(false);
  // Bumped to re-run the effect below (retry, permission just granted, back from Settings)
  const [attempt, setAttempt] = useState(0);

  useFocusEffect(
    useCallback(() => {
      // `attempt` only re-runs this effect (retry / permission granted / back from Settings)
      void attempt;
      if (!enabled) return;
      let cancelled = false;
      let subscription: Location.LocationSubscription | null = null;
      let newest = 0;

      const show = (fix: Location.LocationObject) => {
        // The one-off fix and the watcher can arrive out of order; never go back in time
        if (cancelled || fix.timestamp < newest) return;
        newest = fix.timestamp;
        setPosition(toUserLocation(fix));
        setLocating(false);
        setNoFix(false);
      };

      const start = async () => {
        try {
          const current = await Location.getForegroundPermissionsAsync();
          if (cancelled) return;
          setCanAskAgain(current.canAskAgain);
          if (!current.granted) {
            setPermission(current.status === Location.PermissionStatus.UNDETERMINED ? "unknown" : "denied");
            setPosition(null);
            return;
          }
          setPermission("granted");

          const servicesOn = await Location.hasServicesEnabledAsync();
          if (cancelled) return;
          setServicesOff(!servicesOn);
          if (!servicesOn) {
            setPosition(null);
            return;
          }

          setLocating(true);
          setNoFix(false);

          const watcher = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              distanceInterval: WATCH_DISTANCE_M,
              timeInterval: WATCH_INTERVAL_MS,
            },
            show,
            () => {
              if (!cancelled) {
                setLocating(false);
                setNoFix(true);
              }
            },
          );
          if (cancelled) {
            watcher.remove();
            return;
          }
          subscription = watcher;

          const timeout = setTimeout(() => {
            if (!cancelled && newest === 0) {
              setLocating(false);
              setNoFix(true);
            }
          }, FIX_TIMEOUT_MS);
          try {
            show(await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest }));
          } catch {
            // The watcher may still deliver a fix; the timeout above reports "no fix yet"
          } finally {
            clearTimeout(timeout);
          }
          if (!cancelled && newest === 0) {
            setLocating(false);
            setNoFix(true);
          }
        } catch {
          if (!cancelled) {
            setLocating(false);
            setNoFix(true);
          }
        }
      };
      void start();

      // Coming back from the Settings app doesn't refocus the screen, so re-check then
      const appState = AppState.addEventListener("change", (state) => {
        if (state === "active") setAttempt((n) => n + 1);
      });

      return () => {
        cancelled = true;
        subscription?.remove();
        appState.remove();
      };
    }, [enabled, attempt]),
  );

  const refresh = useCallback(() => setAttempt((n) => n + 1), []);

  const request = useCallback(async (): Promise<LocationPermissionState> => {
    try {
      const current = await Location.getForegroundPermissionsAsync();
      const response = current.granted ? current : await Location.requestForegroundPermissionsAsync();
      setCanAskAgain(response.canAskAgain);
      const next: LocationPermissionState = response.granted ? "granted" : "denied";
      setPermission(next);
      // Start (or retry) the fix; the effect re-checks services and permission itself
      setAttempt((n) => n + 1);
      return next;
    } catch {
      setNoFix(true);
      return "denied";
    }
  }, []);

  return { position, permission, canAskAgain, servicesOff, locating, noFix, request, refresh };
};

/** Short explanation for the current state, or null when the dot is showing normally */
export const userLocationMessage = (state: UserLocationState): string | null => {
  if (state.permission === "denied") {
    return state.canAskAgain
      ? "Location permission is off, so we can't show where you are. Tap Show my location to allow it."
      : "Location permission is off for PowerWatch. Turn it on in Settings to see where you are.";
  }
  if (state.permission !== "granted") return null;
  if (state.servicesOff) return "Location services are off on your phone. Turn them on to see where you are.";
  if (!state.position) {
    if (state.noFix) return "Can't get your location yet. Try again outdoors or check that location is on.";
    return "Finding your location…";
  }
  if (state.position.accuracy >= 100) {
    return `Your location is approximate (within about ${Math.round(state.position.accuracy)} m).`;
  }
  return null;
};
