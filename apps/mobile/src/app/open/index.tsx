import { Redirect } from "expo-router";

/**
 * Android App Link target for https://powerwatch.oyinlola.site/open (see app.json's
 * android.intentFilters). There's no dedicated screen for it — just send the person
 * through a normal app start, which routes them on (splash -> onboarding/dashboard/etc.)
 * exactly as if they had opened the app directly.
 */
const Open = () => <Redirect href="/" />;

export default Open;
