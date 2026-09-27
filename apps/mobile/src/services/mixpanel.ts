import { Mixpanel } from "mixpanel-react-native";

const token = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;

// JavaScript mode (useNative = false) runs in Expo Go as well as store builds.
// Without a token analytics are skipped instead of crashing the app.
const client = token ? new Mixpanel(token, false, false) : null;
const ready = client?.init().catch(() => undefined);

const mixpanel = {
  track(event: string, properties?: Record<string, unknown>) {
    if (!client) return;
    void ready?.then(() => client.track(event, properties));
  },
};

export default mixpanel;
