import { useEffect } from "react";
import { Stack } from "expo-router";
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
import mixpanel from "../services/mixpanel";
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
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.screenBg } }}
      >
        <Stack.Screen name="index" options={{ animation: "none" }} />
        <Stack.Screen name="onboarding" options={{ animation: "none" }} />
        <Stack.Screen name="dashboard" options={{ animation: "fade" }} />
        <Stack.Screen name="history" options={{ animation: "fade" }} />
        <Stack.Screen name="settings" options={{ animation: "fade" }} />
      </Stack>
    </SafeAreaProvider>
  );
};

export default RootLayout;
