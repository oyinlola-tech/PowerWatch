import { StyleSheet, Text, View } from "react-native";
import BackHeader from "../components/layout/BackHeader";
import Screen from "../components/layout/Screen";
import { alpha, colors, fonts, type } from "../theme";

interface DocSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

const LAST_UPDATED = "September 27, 2026";

const sections: DocSection[] = [
  {
    heading: "1. What we collect",
    paragraphs: ["When you use PowerWatch we collect:"],
    bullets: [
      "Account details: your name, email address and password. Passwords are stored hashed, never in plain text.",
      "Your primary neighborhood, any saved neighborhoods, and their location details (such as LGA and state).",
      "Your reports: Power ON or Power OFF, the neighborhood, the time, and your device type.",
      "Your phone's GPS location, only when you choose \"Use current location\" to find your neighborhood.",
      "Your device's push token and device name, so we can send you notifications.",
      "Sign-in sessions, including IP address and user agent, to keep your account secure.",
      "App usage events (for example, app opened or sign up completed) through Mixpanel, when analytics is enabled.",
    ],
  },
  {
    heading: "2. How we use it",
    paragraphs: ["We use this information to:"],
    bullets: [
      "Work out and show neighborhood power statuses and outage history.",
      "Send outage and restoration alerts for your primary and saved neighborhoods.",
      "Create, verify and secure your account, including password resets.",
      "Understand how the app is used so we can fix problems and improve it.",
    ],
  },
  {
    heading: "3. Sharing",
    paragraphs: [
      "Your reports are shown to other users anonymously (for example, \"Neighbor reported ON\"). Your name and email are not shown with them.",
      "We use service providers to run PowerWatch: an email delivery service for verification and password reset codes; Expo, Apple and Google to deliver push notifications; OpenStreetMap's Nominatim service to look up the area for a GPS point when you use your current location; and Mixpanel for app analytics. Map tiles are provided by OpenFreeMap using OpenStreetMap data.",
      "We do not sell your personal data.",
    ],
  },
  {
    heading: "4. Retention and deletion",
    paragraphs: [
      "We keep your information while you have an account. You can delete your account at any time from Profile > Profile Settings. This signs you out on all devices and deletes your profile.",
    ],
  },
  {
    heading: "5. Your choices",
    paragraphs: [
      "You can turn Outage Alerts, Restoration Alerts and Community Updates on or off in Profile, and you can turn off notifications for PowerWatch in your phone's settings.",
      "Location permission is optional. Instead of using your current location, you can search for your neighborhood by name.",
    ],
  },
  {
    heading: "6. Security",
    paragraphs: [
      "Passwords are stored hashed, and email addresses are verified with a one-time code. We recommend using PowerWatch over encrypted (HTTPS) connections and choosing a password you do not use elsewhere.",
      "No system is perfectly secure, but we work to protect your information.",
    ],
  },
  {
    heading: "7. Changes to this policy",
    paragraphs: [
      "We may update this Privacy Policy as PowerWatch changes. The date at the top shows when it was last updated.",
    ],
  },
];

// Privacy Policy
const Privacy = () => (
  <Screen top={23} bottom={40}>
    <BackHeader height={63} />

    <View style={styles.main}>
      <View style={styles.intro}>
        <Text accessibilityRole="header" style={styles.title}>
          Privacy Policy
        </Text>
        <Text style={styles.updated}>Last updated: {LAST_UPDATED}</Text>
      </View>

      {sections.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text accessibilityRole="header" style={styles.heading}>
            {section.heading.toUpperCase()}
          </Text>
          <View style={styles.card}>
            {section.paragraphs.map((paragraph) => (
              <Text key={paragraph} style={styles.body}>
                {paragraph}
              </Text>
            ))}
            {section.bullets?.map((bullet) => (
              <View key={bullet} style={styles.bullet}>
                <View style={styles.dot} />
                <Text style={[styles.body, styles.bulletText]}>{bullet}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  </Screen>
);

const styles = StyleSheet.create({
  main: {
    gap: 24,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  intro: {
    gap: 8,
  },
  title: {
    ...type.h1,
    color: colors.bg,
  },
  updated: {
    fontFamily: fonts.hankenMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    color: colors.slate,
  },
  section: {
    gap: 8,
  },
  heading: {
    ...type.boldText,
    color: colors.navy,
  },
  card: {
    gap: 12,
    borderWidth: 1,
    borderColor: alpha(colors.stroke, 0.6),
    borderRadius: 8,
    backgroundColor: colors.white,
    padding: 16,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.slate,
  },
  bullet: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  dot: {
    width: 5,
    height: 5,
    marginTop: 9,
    borderRadius: 9999,
    backgroundColor: colors.primary,
  },
  bulletText: {
    flex: 1,
  },
});

export default Privacy;
