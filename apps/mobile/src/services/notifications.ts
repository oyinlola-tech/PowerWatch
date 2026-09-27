import { Platform } from "react-native";
import Constants from "expo-constants";
import { authApi } from "./api";
import { pushTokenStore } from "./api/storage";

export type NotificationPermission = "default" | "granted" | "denied" | "unsupported";

// Loaded on demand so the module only initialises on the screens that need it
const loadNotifications = () => import("expo-notifications");

type PermissionResponse = Awaited<
  ReturnType<Awaited<ReturnType<typeof loadNotifications>>["getPermissionsAsync"]>
>;

const toPermission = (response: PermissionResponse): NotificationPermission => {
  if (response.granted) return "granted";
  return response.canAskAgain ? "default" : "denied";
};

export const getNotificationPermission = async (): Promise<NotificationPermission> => {
  try {
    const Notifications = await loadNotifications();
    return toPermission(await Notifications.getPermissionsAsync());
  } catch {
    return "unsupported";
  }
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  try {
    const Notifications = await loadNotifications();
    return toPermission(await Notifications.requestPermissionsAsync());
  } catch {
    return "unsupported";
  }
};

/** Show alerts while the app is open, and set up the Android channel the server sends to. */
export const configureNotifications = async () => {
  if (Platform.OS === "web") return;
  try {
    const Notifications = await loadNotifications();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Power alerts",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0663EA",
      });
    }
  } catch {
    // Notifications are optional; the app works without them
  }
};

/**
 * Get this device's Expo push token and register it with the backend.
 * Returns false (never throws) if permission is missing or the build has no
 * push credentials yet (Android needs FCM configured in the EAS project).
 */
export const registerForPushNotifications = async (): Promise<boolean> => {
  if (Platform.OS === "web") return false;
  try {
    const Notifications = await loadNotifications();
    if (!(await Notifications.getPermissionsAsync()).granted) return false;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

    await authApi.registerPushToken({
      expoPushToken: token,
      deviceType: Platform.OS === "ios" ? "IOS" : "ANDROID",
      deviceName: Constants.deviceName ?? undefined,
    });
    await pushTokenStore.set(token);
    return true;
  } catch {
    return false;
  }
};

export const unregisterPushNotifications = async () => {
  const token = await pushTokenStore.get();
  if (!token) return;
  await authApi.unregisterPushToken(token).catch(() => {});
  await pushTokenStore.clear();
};
