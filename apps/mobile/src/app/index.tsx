import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../context/AuthContext";
import type { User } from "../services/api";
import { lightColors, type } from "../theme";

/** Where a signed-in user resumes: finish verification and setup before Home. */
export const homeRouteFor = (user: User) => {
  if (!user.emailVerified) return "/verify" as const;
  if (!user.neighborhoodId) return "/how-it-works" as const;
  return "/dashboard" as const;
};

// Figma "Splash Screen" (3:394)
const SplashScreen = () => {
  const { status, user } = useAuth();
  // Prototype: show the splash for at least 800ms
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!minTimeElapsed || status === "loading") return;
    if (status === "signedIn" && user) router.replace(homeRouteFor(user));
    else router.replace("/onboarding");
  }, [minTimeElapsed, status, user]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.container}>
        <Image
          source={require("../../assets/images/logo-primary.png")}
          accessibilityLabel="PowerWatch"
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={[type.boldText, styles.tagline]}>Monitoring your energy in real-time</Text>
      </View>
    </View>
  );
};

// The splash is the brand-blue screen in both themes
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: lightColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  container: {
    alignItems: "center",
    gap: 7,
  },
  logo: {
    width: 99,
    height: 99,
  },
  tagline: {
    textAlign: "center",
    color: lightColors.text,
  },
});

export default SplashScreen;
