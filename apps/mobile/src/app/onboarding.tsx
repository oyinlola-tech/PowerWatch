import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";
import { alpha, fonts, shadows, type } from "../theme";
import { makeStyles, useTheme } from "../theme/ThemeContext";

// Figma "Onboarding - Welcome" (3:201)
const Onboarding = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: Math.max(37, insets.top + 8),
          paddingBottom: Math.max(37, insets.bottom + 8),
        },
      ]}
    >
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Logo />
        </View>

        <View style={styles.body}>
          {/* Hero image with pager dots */}
          <View style={styles.hero}>
            <Image
              source={require("../../assets/images/onboarding-hero.jpg")}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              accessibilityLabel="Power lines"
            />
            <View style={styles.heroOverlay} />
            <View style={styles.dots}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>

          {/* Text */}
          <View style={styles.text}>
            <Text accessibilityRole="header" style={[type.h1, { color: colors.bg }]}>
              Stay informed during{"\n"}power outages
            </Text>
            <Text style={styles.description}>
              {
                "Join your community in tracking real-time\npower status and reporting outages in\nyour neighborhood."
              }
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.actions}>
            <Button label="Get Started" height={48} onPress={() => router.push("/register")} />
            <Button
              label="Login"
              variant="secondary"
              height={48}
              onPress={() => router.push("/login")}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const useStyles = makeStyles((c) => ({
  screen: {
    flex: 1,
    backgroundColor: c.screenBg,
    paddingHorizontal: 16,
  },
  card: {
    flex: 1,
    width: "100%",
    maxWidth: 390,
    alignSelf: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    backgroundColor: c.card,
    boxShadow: shadows.card,
  },
  header: {
    height: 33,
    justifyContent: "center",
    paddingBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
    paddingLeft: 22,
  },
  body: {
    flex: 1,
    paddingHorizontal: 23,
    paddingTop: 32,
    paddingBottom: 38,
  },
  hero: {
    height: 258,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: c.primary,
    borderRadius: 12,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: alpha("#021633", 0.4),
  },
  dots: {
    position: "absolute",
    top: 167,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    backgroundColor: c.border,
  },
  text: {
    marginTop: 53,
    gap: 16,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 23,
    color: c.gray600,
    opacity: 0.8,
  },
  actions: {
    marginTop: "auto",
    gap: 11,
    paddingTop: 16,
  },
}));

export default Onboarding;
