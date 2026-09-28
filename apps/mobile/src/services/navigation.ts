import { Alert } from "react-native";
import { router } from "expo-router";
import type { PowerStatus } from "../types/power";

export type NavItem = "dashboard" | "history" | "settings" | "map";

/** For features that need setup outside the app first (e.g. social sign-in) */
export const comingSoon = (feature: string) =>
  Alert.alert(feature, `${feature} is coming soon.`);

// The dashboard is the root of the signed-in stack; other tabs sit on top of it.
// `onTabRoot` is false on screens opened from a tab (e.g. Profile Settings).
export const goToTab = (item: NavItem, active: NavItem, onTabRoot = true) => {
  if (item === active && onTabRoot) return;

  if (item === "dashboard" || item === active) {
    // Back to a tab that is already underneath this screen
    router.dismissTo(`/${item}`);
  } else if (!onTabRoot) {
    router.dismissTo("/dashboard");
    router.push(`/${item}`);
  } else if (active === "dashboard") {
    router.push(`/${item}`);
  } else {
    router.replace(`/${item}`);
  }
};

export const goToDashboard = () => {
  if (router.canDismiss()) router.dismissAll();
  router.replace("/dashboard");
};

export const goBack = () => {
  if (router.canGoBack()) router.back();
  // The splash route sends signed-in users Home and everyone else to onboarding
  else router.replace("/");
};

export const changeNeighborhood = () =>
  router.push({ pathname: "/location", params: { returnTo: "back" } });

/** Pick a neighborhood to follow (saved neighborhoods) with the location screen */
export const addSavedNeighborhood = () =>
  router.push({ pathname: "/location", params: { returnTo: "back", mode: "save" } });

export const reportPower = (status: PowerStatus) =>
  router.push({ pathname: "/confirm/[status]", params: { status } });

export const startReport = () =>
  Alert.alert("Report power status", "What would you like to report?", [
    { text: "Power is ON", onPress: () => reportPower("on") },
    { text: "Power is OFF", onPress: () => reportPower("off") },
    { text: "Cancel", style: "cancel" },
  ]);
