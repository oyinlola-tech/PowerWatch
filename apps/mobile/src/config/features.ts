// Feature flags that need no app update to see (only env changes per build).

/**
 * Sign in with Apple. Off until we have an Apple Developer membership to configure it
 * with (Sign In with Apple capability, Services ID, key). The button still shows on iOS
 * so people know it's coming, but tapping it explains it isn't ready yet instead of
 * doing nothing.
 *
 * To switch it on later: install and configure `expo-apple-authentication` (native
 * module + config plugin — see https://docs.expo.dev/versions/latest/sdk/apple-authentication/),
 * wire it up the same way `src/services/googleAuth.ts` wraps Google Sign-In, and set
 * EXPO_PUBLIC_APPLE_SIGN_IN_ENABLED=1 for the builds that should offer it.
 */
export const APPLE_SIGN_IN_ENABLED = process.env.EXPO_PUBLIC_APPLE_SIGN_IN_ENABLED === "1";
