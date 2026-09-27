import { StyleSheet, Text, View } from "react-native";
import BackHeader from "../components/layout/BackHeader";
import Screen from "../components/layout/Screen";
import { alpha, colors, fonts, type } from "../theme";

interface DocSection {
  heading: string;
  paragraphs: string[];
}

const LAST_UPDATED = "September 27, 2026";

const sections: DocSection[] = [
  {
    heading: "1. Using PowerWatch",
    paragraphs: [
      "PowerWatch is a community power-outage tracker for Nigeria. People who use the app report whether power is on or off in their neighborhood, and PowerWatch shows each neighborhood's status based on those reports.",
      "By creating an account or using the app, you agree to these Terms. If you do not agree, please do not use PowerWatch.",
    ],
  },
  {
    heading: "2. Your account and security",
    paragraphs: [
      "To report and receive alerts you need an account with your name, email address and a password. You must verify your email with the code we send you.",
      "Keep your password private and do not share your account. You are responsible for activity on your account. If you forget your password you can reset it with a code sent to your email.",
    ],
  },
  {
    heading: "3. Accurate reporting",
    paragraphs: [
      "Only report what you actually observe in the neighborhood you are reporting for. Do not submit false or misleading reports, or report for places you have no knowledge of.",
      "Neighborhood statuses, confirmations, confidence figures and history are community information built from people's reports. They are not official utility data.",
      "PowerWatch is not affiliated with any electricity distribution company and cannot guarantee that any status, alert or history is accurate, complete or up to date.",
    ],
  },
  {
    heading: "4. Acceptable use",
    paragraphs: [
      "Do not misuse the app. This includes trying to manipulate neighborhood statuses, automating reports, interfering with the service or its security, accessing other people's accounts, or using PowerWatch for anything unlawful.",
    ],
  },
  {
    heading: "5. Account deletion and termination",
    paragraphs: [
      "You can delete your account at any time from Profile > Profile Settings. Deleting your account signs you out on all devices and deletes your profile.",
      "We may suspend or close accounts that abuse reporting or break these Terms.",
    ],
  },
  {
    heading: "6. Changes to these Terms",
    paragraphs: [
      "We may update these Terms as PowerWatch changes. The date at the top shows when they were last updated. If you keep using the app after an update, you accept the updated Terms.",
    ],
  },
  {
    heading: "7. Limitation of liability",
    paragraphs: [
      "PowerWatch is provided \"as is\" and \"as available\", without warranties of any kind. Do not rely on the app for safety-critical or financial decisions.",
      "To the extent allowed by law, PowerWatch is not liable for any loss or damage arising from your use of the app or from reliance on community reports, statuses or alerts, including alerts that are late or not delivered.",
    ],
  },
  {
    heading: "8. Contact",
    paragraphs: [
      "If you have questions about these Terms, you can find help through the app's Help & FAQ page.",
    ],
  },
];

// Terms & Conditions
const Terms = () => (
  <Screen top={23} bottom={40}>
    <BackHeader height={63} />

    <View style={styles.main}>
      <View style={styles.intro}>
        <Text accessibilityRole="header" style={styles.title}>
          {"Terms & Conditions"}
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
});

export default Terms;
