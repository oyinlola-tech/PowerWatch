import { useEffect } from "react";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import {
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
} from "@expo-google-fonts/hanken-grotesk";
import { AuthProvider, useAuth } from "../context/AuthContext";
import mixpanel from "../services/mixpanel";
import { configureNotifications } from "../services/notifications";
import { colors } from "../theme";

// Keep the native splash up until the design's fonts are ready
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    Selawik_400Regular: require("../../assets/fonts/Selawik-Regular.ttf"),
    Selawik_600SemiBold: require("../../assets/fonts/Selawik-Semibold.ttf"),
    Selawik_700Bold: require("../../assets/fonts/Selawik-Bold.ttf"),
  });

  useEffect(() => {
    mixpanel.track("app_opened");
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <RootStack />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

// Tapping a power alert opens Home
const useNotificationTaps = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;
    let subscription: { remove: () => void } | undefined;
    let cancelled = false;
    void configureNotifications();
    import("expo-notifications")
      .then((Notifications) => {
        if (cancelled) return;
        subscription = Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data as { type?: string } | undefined;
          if (data?.type === "POWER_STATUS") router.navigate("/dashboard");
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [enabled]);
};

const RootStack = () => {
  const { status } = useAuth();
  const signedIn = status === "signedIn";
  useNotificationTaps(signedIn);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.screenBg } }}>
      {/* Splash: waits for the saved session, then routes (see app/index.tsx) */}
      <Stack.Screen name="index" options={{ animation: "none" }} />

      {/* Public information pages */}
      <Stack.Screen name="terms" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="help" />
      <Stack.Screen name="about" />

      <Stack.Protected guard={status === "signedOut"}>
        <Stack.Screen name="onboarding" options={{ animation: "none" }} />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="reset-password" />
      </Stack.Protected>

      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="verify" />
        <Stack.Screen name="how-it-works" />
        <Stack.Screen name="location" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="dashboard" options={{ animation: "fade" }} />
        <Stack.Screen name="map" options={{ animation: "fade" }} />
        <Stack.Screen name="history" options={{ animation: "fade" }} />
        <Stack.Screen name="settings" options={{ animation: "fade" }} />
        <Stack.Screen name="confirm/[status]" />
        <Stack.Screen name="report-submitted/[status]" />
        <Stack.Screen name="my-reports" />
        <Stack.Screen name="saved-neighborhoods" />
        <Stack.Screen name="profile-settings" />
        <Stack.Screen name="language" />
      </Stack.Protected>
    </Stack>
  );
};

export default RootLayout;
