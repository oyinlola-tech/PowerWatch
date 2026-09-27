import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors, type } from "../theme";

// Figma "Splash Screen" (3:394)
const SplashScreen = () => {
  useEffect(() => {
    // Prototype: after an 800ms delay, navigate to Onboarding - Welcome
    const timer = setTimeout(() => router.replace("/onboarding"), 800);
    return () => clearTimeout(timer);
  }, []);

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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
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
    color: colors.text,
  },
});

export default SplashScreen;
