import AsyncStorage from "@react-native-async-storage/async-storage";
import { Mixpanel } from "mixpanel-react-native";

const token = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;
const CHOICE_KEY = "pw.analytics";

// Usage statistics are only collected once the person has agreed to the Privacy
// Policy (sign-up or sign-in), and never after they switch them off in
// Profile Settings. Until then nothing is created, stored or sent.
let choice: "on" | "off" | null = null;
const loaded = AsyncStorage.getItem(CHOICE_KEY)
  .then((value) => {
    if (value === "on" || value === "off") choice = value;
  })
  .catch(() => {});

// JavaScript mode (useNative = false) runs in Expo Go as well as store builds.
// Without a token analytics are skipped instead of crashing the app.
let starting: Promise<Mixpanel | null> | null = null;
const start = () => {
  if (!token) return Promise.resolve(null);
  starting ??= (async () => {
    const client = new Mixpanel(token, false, false);
    await client.init();
    // Events carry no location: Mixpanel must not derive one from the IP address
    client.setUseIpAddressForGeolocation(false);
    return client;
  })().catch(() => null);
  return starting;
};

const save = async (next: "on" | "off") => {
  choice = next;
  await AsyncStorage.setItem(CHOICE_KEY, next).catch(() => {});
};

const mixpanel = {
  track(event: string, properties?: Record<string, unknown>) {
    void loaded.then(async () => {
      if (choice !== "on") return;
      (await start())?.track(event, properties);
    });
  },

  /** Called when someone signs up or signs in. Keeps an earlier "off" choice. */
  async allow() {
    await loaded;
    if (choice === null) await save("on");
  },

  async isEnabled() {
    await loaded;
    return choice === "on";
  },

  /** The "Usage statistics" switch in Profile Settings */
  async setEnabled(enabled: boolean) {
    await loaded;
    await save(enabled ? "on" : "off");
    const client = await start();
    if (enabled) client?.optInTracking();
    else client?.optOutTracking();
  },
};

export default mixpanel;
