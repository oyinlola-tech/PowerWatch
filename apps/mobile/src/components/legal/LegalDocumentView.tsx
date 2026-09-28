import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import AppHeader from "../layout/AppHeader";
import Screen from "../layout/Screen";
import { contactSection, LEGAL_LAST_UPDATED } from "../../content/legal";
import type { LegalContact, LegalDocument } from "../../content/legal";
import { alpha, fonts, type } from "../../theme";
import { makeStyles } from "../../theme/ThemeContext";

const CONTACT: LegalContact = {
  name: process.env.EXPO_PUBLIC_LEGAL_NAME?.trim() || undefined,
  address: process.env.EXPO_PUBLIC_LEGAL_ADDRESS?.trim() || undefined,
  email: process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() || undefined,
  dataProtectionEmail: process.env.EXPO_PUBLIC_DATA_PROTECTION_EMAIL?.trim() || undefined,
};

interface Props {
  document: LegalDocument;
  /** Link to the companion document shown at the end */
  related: { label: string; href: "/privacy" | "/terms" };
}

// Privacy Policy / Terms & Conditions (no Figma frame; Profile screen family).
// The wording lives in content/legal.ts, shared with the website.
const LegalDocumentView = ({ document, related }: Props) => {
  const styles = useStyles();
  const sections = [...document.sections, contactSection(CONTACT)];

  return (
    <Screen header={<AppHeader back />} nav="settings">
      <View style={styles.main}>
        <View style={styles.intro}>
          <Text accessibilityRole="header" style={styles.title}>
            {document.title}
          </Text>
          <Text style={styles.updated}>Last updated: {LEGAL_LAST_UPDATED}</Text>
          <View style={styles.summary}>
            <Text style={styles.body}>{document.summary}</Text>
          </View>
        </View>

        {sections.map((section, index) => (
          <View key={section.heading} style={styles.section}>
            <Text accessibilityRole="header" style={styles.heading}>
              {`${index + 1}. ${section.heading}`.toUpperCase()}
            </Text>
            <View style={styles.card}>
              {section.paragraphs?.map((paragraph) => (
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

        <Pressable accessibilityRole="link" onPress={() => router.push(related.href)} hitSlop={8}>
          <Text style={[type.boldText, styles.related]}>Read our {related.label}</Text>
        </Pressable>
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
  updated: {
    fontFamily: fonts.hankenMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    color: c.slate,
  },
  summary: {
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: c.accent,
    borderRadius: 4,
    backgroundColor: alpha(c.accent, 0.05),
    padding: 12,
  },
  section: {
    gap: 8,
  },
  heading: {
    ...type.boldText,
    color: c.navy,
  },
  card: {
    gap: 12,
    borderWidth: 1,
    borderColor: c.border,
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
    backgroundColor: c.accent,
  },
  bulletText: {
    flex: 1,
  },
  related: {
    textAlign: "center",
    color: c.accent,
    paddingBottom: 8,
  },
}));

export default LegalDocumentView;
