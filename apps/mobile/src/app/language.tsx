import { Text, View } from "react-native";
import BackHeader from "../components/layout/BackHeader";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import { Divider, Row, Section } from "../components/ui/ListSection";
import { fonts, type } from "../theme";
import { makeStyles } from "../theme/ThemeContext";

const upcoming = ["Yorùbá", "Hausa", "Igbo", "Nigerian Pidgin"];

const Check = () => {
  const styles = useStyles();
  return (
    <View style={styles.check}>
      <View style={styles.checkmark} />
    </View>
  );
};

// Language
const Language = () => {
  const styles = useStyles();

  return (
    <Screen top={23} bottom={40}>
      <BackHeader height={63} />

      <View style={styles.main}>
        <Text accessibilityRole="header" style={styles.title}>
          Language
        </Text>

        <Section title="APP LANGUAGE">
          <View accessible accessibilityRole="radio" accessibilityState={{ checked: true }} accessibilityLabel="English (US)">
            <Row title="English (US)" right={<Check />} />
          </View>
          {upcoming.map((language) => (
            <View key={language}>
              <Divider />
              <View
                accessible
                accessibilityRole="radio"
                accessibilityState={{ checked: false, disabled: true }}
                accessibilityLabel={`${language}, coming soon`}
                style={styles.disabled}
              >
                <Row title={language} subtitle="Coming soon" />
              </View>
            </View>
          ))}
        </Section>

        <View style={styles.note}>
          <View style={styles.noteIcon}>
            <Icon name="infoSolid" />
          </View>
          <Text style={styles.noteText}>
            PowerWatch is currently available in English. More languages are coming soon.
          </Text>
        </View>
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
  title: {
    ...type.h1,
    color: c.bg,
  },
  check: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: c.primary,
  },
  checkmark: {
    width: 10,
    height: 6,
    marginTop: -2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: c.white,
    transform: [{ rotate: "-45deg" }],
  },
  disabled: {
    opacity: 0.5,
  },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: c.borderLight,
    borderRadius: 8,
    backgroundColor: c.surface,
    padding: 15,
  },
  noteIcon: {
    paddingTop: 3,
  },
  noteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: c.gray600,
  },
}));

export default Language;
