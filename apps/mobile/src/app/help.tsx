import { Text, View } from "react-native";
import AppHeader from "../components/layout/AppHeader";
import Screen from "../components/layout/Screen";
import Accordion from "../components/ui/Accordion";
import type { AccordionItem } from "../components/ui/Accordion";
import { fonts, type } from "../theme";
import { makeStyles } from "../theme/ThemeContext";

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
    title: "Why do I need to allow location to report?",
    body:
      "A report always counts for the neighborhood and street your phone's GPS says you're standing in right now — never a saved or chosen area. Without a precise, genuine GPS fix, PowerWatch can't tell where to file the report, so it can't be submitted. Simulated (\"mock\") locations are refused.",
  },
  {
    title: "Why does PowerWatch use my location?",
    body:
      "To work out your home neighborhood when you sign up or change it, and, every time you report, to work out which neighborhood and street the report counts for. Location is only used while the app is open. Other users never see your location or your name; see the Privacy Policy for details.",
  },
  {
    title: "How do I change my neighborhood?",
    body:
      "On Home, tap Change next to your neighborhood, or go to Profile > Primary Location. You can use your current location, search for a neighborhood, or drag the map so the pin sits exactly on your home.",
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
      "Go to Profile > Profile Settings and choose to delete your account. This signs you out on all devices and erases your personal details. Your past reports stay only as anonymous ON/OFF records, without their locations.",
  },
];

// Help & FAQ
const Help = () => {
  const styles = useStyles();

  return (
    <Screen header={<AppHeader back />} nav="settings">
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
};

const useStyles = makeStyles((c) => ({
  main: {
    gap: 24,
  },
  intro: {
    gap: 8,
  },
  title: {
    ...type.h1,
    color: c.bg,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: c.slate,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    ...type.boldText,
    color: c.navy,
  },
}));

export default Help;
