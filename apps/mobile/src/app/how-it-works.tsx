import { Text, View } from "react-native";
import { router } from "expo-router";
import AppHeader from "../components/layout/AppHeader";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import type { GlyphName } from "../components/icons/glyphs";
import Button from "../components/ui/Button";
import { fonts, type } from "../theme";
import { makeStyles } from "../theme/ThemeContext";

interface Step {
  icon: GlyphName;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: "boltLarge",
    title: "Real-time Updates",
    description: "Get instant alerts when power goes out or is restored in your grid.",
  },
  {
    icon: "bullhornLarge",
    title: "Report Outages",
    description: "Easily log an outage with one tap to help neighbors stay informed.",
  },
  {
    icon: "mapLocationLarge",
    title: "Community Map",
    description: "Visualize outages across the city with our interactive live map.",
  },
];

// Figma "Signup Screen Wireframe" (12:693), the "How it works" screen
const HowItWorks = () => {
  const styles = useStyles();

  return (
    <Screen header={<AppHeader />} bottom={40}>
      <View>
        <Text accessibilityRole="header" style={[type.h1, styles.title]}>
          How it works
        </Text>

        <View style={styles.cards}>
          {steps.map(({ icon, title, description }) => (
            <View key={title} style={styles.card}>
              <View style={styles.badge}>
                <Icon name={icon} />
              </View>

              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardBody}>{description}</Text>
              </View>
            </View>
          ))}
        </View>

        <Button label="Next" height={48} onPress={() => router.push("/location")} style={styles.next} />
      </View>
    </Screen>
  );
};

const useStyles = makeStyles((c) => ({
  title: {
    marginTop: 8,
    color: c.bg,
  },
  cards: {
    marginTop: 24,
    gap: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 8,
    backgroundColor: c.card,
    // Figma draws the 1px border inside the 16px padding
    padding: 15,
  },
  cardText: {
    flex: 1,
  },
  cardBody: {
    ...type.boldText,
    lineHeight: 20,
    color: c.gray600,
  },
  badge: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: c.primary,
  },
  cardTitle: {
    fontFamily: fonts.segoe,
    fontSize: 16,
    lineHeight: 24,
    color: c.black,
  },
  next: {
    marginTop: 40,
  },
}));

export default HowItWorks;
