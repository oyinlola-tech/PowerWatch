// Wraps @react-native-google-signin/google-signin. That package has no JS fallback —
// it isn't bundled in Expo Go, so the app must never import or call it there (or on
// web). Everything native-facing is behind a dynamic import guarded by
// `isGoogleSignInAvailable()`, so Expo Go and the web build still start normally;
// signing in with Google needs a development build (`npx expo run:android`,
// `npx expo run:ios`, or `npx eas-cli@latest build --profile development`).

import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

/**
 * True only when the native Google Sign-In module can actually be called: not on web,
 * and not in Expo Go (which only bundles Expo's own native modules). Check this before
 * rendering anything that would call into the module.
 */
export const isGoogleSignInAvailable = () =>
  Platform.OS !== "web" &&
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient &&
  Boolean(WEB_CLIENT_ID);

export type GoogleSignInOutcome =
  | { ok: true; idToken: string }
  | {
      ok: false;
      /** cancelled: the person backed out, show nothing. Everything else: show `message`. */
      reason: "unavailable" | "cancelled" | "play-services" | "error";
      message: string;
    };

let configured = false;

const load = async () => {
  const mod = await import("@react-native-google-signin/google-signin");
  if (!configured) {
    // webClientId makes the idToken's audience the web client the API verifies against,
    // on both platforms. iosClientId additionally drives the native sign-in UI on iOS.
    mod.GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      ...(IOS_CLIENT_ID ? { iosClientId: IOS_CLIENT_ID } : {}),
    });
    configured = true;
  }
  return mod;
};

/** Opens Google's native sign-in UI and resolves the ID token to send to POST /auth/google. */
export const signInWithGoogle = async (): Promise<GoogleSignInOutcome> => {
  if (!isGoogleSignInAvailable()) {
    return {
      ok: false,
      reason: "unavailable",
      message: "Google sign-in needs the installed app, not Expo Go. Build a development build to test it.",
    };
  }

  const { GoogleSignin, isCancelledResponse, isSuccessResponse, isErrorWithCode, statusCodes } = await load();

  try {
    if (Platform.OS === "android") {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    const response = await GoogleSignin.signIn();

    if (isCancelledResponse(response)) return { ok: false, reason: "cancelled", message: "" };
    if (!isSuccessResponse(response) || !response.data.idToken) {
      return { ok: false, reason: "error", message: "Google didn't share a sign-in token. Please try again." };
    }

    return { ok: true, idToken: response.data.idToken };
  } catch (error) {
    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) return { ok: false, reason: "cancelled", message: "" };
      if (error.code === statusCodes.IN_PROGRESS) {
        return { ok: false, reason: "error", message: "A sign-in is already in progress." };
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return {
          ok: false,
          reason: "play-services",
          message: "Google Play Services isn't available or up to date on this device.",
        };
      }
    }
    return {
      ok: false,
      reason: "error",
      message: "Couldn't sign in with Google. Please try again.",
    };
  }
};

/** Best-effort local sign-out of the Google account cached by the native SDK. */
export const signOutOfGoogle = async () => {
  if (!isGoogleSignInAvailable()) return;
  try {
    const { GoogleSignin } = await load();
    await GoogleSignin.signOut();
  } catch {
    // Never block the app's own sign-out on this
  }
};
