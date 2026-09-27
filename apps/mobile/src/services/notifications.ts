export type NotificationPermission = "default" | "granted" | "denied" | "unsupported";

// Loaded on demand so the module only initialises on the screen that needs it
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
