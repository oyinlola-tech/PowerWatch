import { Redirect } from "expo-router";

/**
 * Catches any Android App Link under /open/... (pathPrefix "/open" in app.json's
 * android.intentFilters) so it never falls through to the "Unmatched Route" screen.
 * Same as /open itself: just a normal app start.
 */
const OpenCatchAll = () => <Redirect href="/" />;

export default OpenCatchAll;
