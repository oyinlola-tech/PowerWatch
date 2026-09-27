import { StyleSheet, Text, View } from "react-native";
import type { TextStyle } from "react-native";
import { router } from "expo-router";
import LogoHeader from "../components/layout/LogoHeader";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import type { GlyphName } from "../components/icons/glyphs";
import Button from "../components/ui/Button";
import { colors, fonts, type } from "../theme";

interface Step {
  icon: GlyphName;
  title: string;
  description: string;
  /** Width the design gives the text column, which sets where lines wrap */
  textWidth: number;
  descriptionStyle: TextStyle;
  marginTop: number;
}

const medium14: TextStyle = { ...type.boldText };
const segoe14: TextStyle = { fontFamily: fonts.segoe, fontSize: 14, lineHeight: 20 };

const steps: Step[] = [
  {
    icon: "boltLarge",
    title: "Real-time Updates",
    description: "Get instant alerts when power\ngoes out or is restored in your\ngrid.",
    textWidth: 219.2,
    descriptionStyle: medium14,
    marginTop: 23,
  },
  {
    icon: "bullhornLarge",
    title: "Report Outages",
    description: "Easily log an outage with one tap to\nhelp neighbors stay informed.",
    textWidth: 221,
    descriptionStyle: segoe14,
    marginTop: 15,
  },
  {
    icon: "mapLocationLarge",
    title: "Community Map",
    description: "Visualize outages across the\ncity\nwith our interactive live map.",
    textWidth: 229,
    descriptionStyle: medium14,
    marginTop: 26,
  },
];

// Figma "Signup Screen Wireframe" (12:693), the "How it works" screen
const HowItWorks = () => (
  <Screen top={37} bottom={40}>
    <LogoHeader style={styles.header} />

    <View style={styles.content}>
      <Text accessibilityRole="header" style={[type.h1, styles.title]}>
        How it works
      </Text>

      {steps.map(({ icon, title, description, textWidth, descriptionStyle, marginTop }) => (
        <View key={title} style={[styles.card, { marginTop }]}>
          <View style={styles.badge}>
            <Icon name={icon} />
          </View>

          <View style={{ minWidth: textWidth, flexShrink: 1 }}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={[descriptionStyle, { color: colors.gray600 }]}>{description}</Text>
          </View>
        </View>
      ))}

      <Button label="Next" height={48} onPress={() => router.push("/location")} style={styles.next} />
    </View>
  </Screen>
);

const styles = StyleSheet.create({
  header: {
    marginLeft: 12,
    marginRight: 20,
  },
  content: {
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 50,
    marginBottom: 8,
    color: colors.bg,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    // Figma draws the 1px border inside the 16px padding
    padding: 15,
  },
  badge: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: colors.primary,
  },
  cardTitle: {
    fontFamily: fonts.segoe,
    fontSize: 16,
    lineHeight: 24,
    color: colors.black,
  },
  next: {
    marginTop: 56.5,
  },
});

export default HowItWorks;
