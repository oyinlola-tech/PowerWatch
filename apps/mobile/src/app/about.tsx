import { Text, View } from "react-native";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { router } from "expo-router";
import BackHeader from "../components/layout/BackHeader";
import Screen from "../components/layout/Screen";
import { Chevron, Divider, Row, Section } from "../components/ui/ListSection";
import { alpha, fonts, type } from "../theme";
import { makeStyles } from "../theme/ThemeContext";

const version = Constants.expoConfig?.version;

// About PowerWatch
const About = () => {
  const styles = useStyles();

  return (
    <Screen top={23} bottom={40}>
      <BackHeader height={63} />

      <View style={styles.main}>
        <View style={styles.hero}>
          <View style={styles.logoTile}>
            <Image
              source={require("../../assets/images/logo-primary.png")}
              accessibilityLabel="PowerWatch logo"
              style={styles.logo}
              contentFit="contain"
            />
          </View>
          <Text accessibilityRole="header" style={styles.title}>
            PowerWatch
          </Text>
          <Text style={[type.boldText, styles.tagline]}>Monitoring your energy in real-time</Text>
          {version ? <Text style={styles.version}>Version {version}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.body}>
            PowerWatch is a community power-outage tracker for Nigeria. Neighbors report whether power
            is on or off, and each neighborhood&apos;s status follows the majority of recent reports.
          </Text>
          <Text style={styles.body}>
            Follow your primary neighborhood and up to 10 saved places, get alerts when power goes out
            or comes back, and see daily outage history, uptime and the longest outage over the last 7
            or 30 days.
          </Text>
        </View>

        <Section title="INFORMATION">
          <Row title={"Help & FAQ"} onPress={() => router.push("/help")} right={<Chevron />} />
          <Divider />
          <Row title={"Terms & Conditions"} onPress={() => router.push("/terms")} right={<Chevron />} />
          <Divider />
          <Row title="Privacy Policy" onPress={() => router.push("/privacy")} right={<Chevron />} />
        </Section>

        <Text style={styles.footer}>Map data © OpenStreetMap contributors</Text>
      </View>
    </Screen>
  );
};

const useStyles = makeStyles((c) => ({
  main: {
    gap: 24,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  hero: {
    alignItems: "center",
    gap: 8,
  },
  logoTile: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: c.primary,
    marginBottom: 8,
  },
  logo: {
    width: 72,
    height: 72,
  },
  title: {
    ...type.h1,
    color: c.bg,
  },
  tagline: {
    color: c.slate,
  },
  version: {
    fontFamily: fonts.hankenMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    color: c.slate,
    opacity: 0.7,
  },
  card: {
    gap: 12,
    borderWidth: 1,
    borderColor: alpha(c.stroke, 0.6),
    borderRadius: 8,
    backgroundColor: c.card,
    padding: 16,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: c.slate,
  },
  footer: {
    fontFamily: fonts.hankenMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    textAlign: "center",
    color: c.slate,
    opacity: 0.5,
  },
}));

export default About;
