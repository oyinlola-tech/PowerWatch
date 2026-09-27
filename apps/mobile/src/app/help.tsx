import { StyleSheet, Text, View } from "react-native";
import BackHeader from "../components/layout/BackHeader";
import Screen from "../components/layout/Screen";
import Accordion from "../components/ui/Accordion";
import type { AccordionItem } from "../components/ui/Accordion";
import { colors, fonts, type } from "../theme";

const faqs: AccordionItem[] = [
  {
    title: "How is a neighborhood's power status decided?",
    body:
      "PowerWatch follows the majority of people who reported for that neighborhood in the last 30 minutes. Each person counts once, using their most recent report, so the status reflects what most neighbors are seeing right now.",
  },
  {
    title: "What do \"Confirmed by neighbors\" and \"Confidence\" mean?",
    body:
      "\"Confirmed by N neighbors\" is the number of people whose report matches the current status. \"Confidence\" is the percentage of people who reported in the last 2 hours that agree with the current status.",
  },
  {
    title: "Why didn't my report change the status?",
    body:
      "The status follows the majority, so one report on its own may not change it. If other neighbors reported the opposite recently, the status stays the same until more people report what you are seeing.",
  },
  {
    title: "How often can I report?",
    body:
      "You can report once per neighborhood every 5 minutes. This keeps the status fair and stops accidental repeat reports.",
  },
  {
    title: "How do I change my neighborhood?",
    body:
      "On Home, tap Change next to your neighborhood, or go to Profile > Primary Location. You can search for a neighborhood or use your current location.",
  },
  {
    title: "What are saved neighborhoods?",
    body:
      "Besides your primary neighborhood, you can follow up to 10 extra places, such as your workplace or a family member's area. You'll get power alerts for them too. Manage them from Profile.",
  },
  {
    title: "Why am I not getting notifications?",
    body:
      "Check that Outage Alerts and Restoration Alerts are turned on in Profile, and that notifications are allowed for PowerWatch in your phone's settings. Alerts are sent for your primary and saved neighborhoods.",
  },
  {
    title: "What does the History tab show?",
    body:
      "History shows each day's outage periods, total outage time, uptime percentage and the longest outage for the last 7 or 30 days. Days follow Nigerian time.",
  },
  {
    title: "How do I reset my password?",
    body:
      "On the Login screen, tap Forgot Password? and enter your email. We'll email you a code to set a new password.",
  },
  {
    title: "How do I delete my account?",
    body:
      "Go to Profile > Profile Settings and choose to delete your account. This signs you out on all devices and deletes your profile.",
  },
];

// Help & FAQ
const Help = () => (
  <Screen top={23} bottom={40}>
    <BackHeader height={63} />

    <View style={styles.main}>
      <View style={styles.intro}>
        <Text accessibilityRole="header" style={styles.title}>
          {"Help & FAQ"}
        </Text>
        <Text style={styles.body}>
          Answers to common questions about reporting power, neighborhood status and alerts.
        </Text>
      </View>

      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          FREQUENTLY ASKED QUESTIONS
        </Text>
        <Accordion items={faqs} />
      </View>
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
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.slate,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    ...type.boldText,
    color: colors.navy,
  },
});

export default Help;
