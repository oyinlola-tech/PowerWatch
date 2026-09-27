import { Alert } from "react-native";
import { router } from "expo-router";
import type { PowerStatus } from "../types/power";

export type NavItem = "dashboard" | "history" | "settings" | "maps";

/** For destinations the design links to but that have no screen yet */
export const notAvailableYet = (feature: string) =>
  Alert.alert(feature, `${feature} is not available yet.`);

// The dashboard is the root of the signed-in stack; other tabs sit on top of it
export const goToTab = (item: NavItem, active: NavItem) => {
  if (item === active) return;

  if (item === "maps") {
    notAvailableYet("Maps");
  } else if (item === "dashboard") {
    router.dismissTo("/dashboard");
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
  else router.replace("/dashboard");
};

export const changeNeighborhood = () =>
  router.push({ pathname: "/location", params: { returnTo: "back" } });

export const reportPower = (status: PowerStatus) =>
  router.push({ pathname: "/confirm/[status]", params: { status } });

export const startReport = () =>
  Alert.alert("Report power status", "What would you like to report?", [
    { text: "Power is ON", onPress: () => reportPower("on") },
    { text: "Power is OFF", onPress: () => reportPower("off") },
    { text: "Cancel", style: "cancel" },
  ]);
