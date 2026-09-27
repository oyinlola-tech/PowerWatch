import { useState } from "react";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import BackHeader from "../components/layout/BackHeader";
import NavBar from "../components/layout/NavBar";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import type { GlyphName } from "../components/icons/glyphs";
import Toggle from "../components/ui/Toggle";
import { changeNeighborhood, notAvailableYet } from "../services/navigation";
import { alpha, colors, fonts, type } from "../theme";

interface RowProps {
  icon: GlyphName;
  /** Width of the icon's slot in the design (icons differ in size) */
  iconWidth: number;
  title: string;
  subtitle?: string;
  subtitleStyle?: "default" | "link";
  right: ReactNode;
  onPress?: () => void;
}

const Row = ({
  icon,
  iconWidth,
  title,
  subtitle,
  subtitleStyle = "default",
  right,
  onPress,
}: RowProps) => {
  const content = (
    <>
      <View style={styles.rowLeft}>
        <View style={{ width: iconWidth, alignItems: "center" }}>
          <Icon name={icon} />
        </View>
        <View>
          <Text style={[type.boldText, { color: colors.ink }]}>{title}</Text>
          {subtitle && (
            <Text style={subtitleStyle === "link" ? styles.subtitleLink : styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {right}
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      {content}
    </Pressable>
  );
};

const Divider = () => <View style={styles.divider} />;

interface SectionProps {
  title: string;
  titleColor?: string;
  children: ReactNode;
}

const Section = ({ title, titleColor = colors.navy, children }: SectionProps) => (
  <View style={styles.section}>
    <Text accessibilityRole="header" style={[type.boldText, { color: titleColor }]}>
      {title}
    </Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

const chevron = <Icon name="chevronRight" />;

// Figma "Profile" (143:217)
const Profile = () => {
  const [prefs, setPrefs] = useState({
    powerStatusAlerts: true,
    communityUpdates: false,
    darkMode: false,
    dataSaverMode: true,
  });

  const toggle = (key: keyof typeof prefs) => (value: boolean) =>
    setPrefs((prev) => ({ ...prev, [key]: value }));

  const handleSignOut = () => {
    // TODO: clear auth session
    if (router.canDismiss()) router.dismissAll();
    router.replace("/login");
  };

  return (
    <Screen top={23} bottom={80} overlay={<NavBar active="settings" />}>
      <BackHeader height={63} />

      <View style={styles.main}>
        {/* Summary */}
        <View style={styles.summary}>
          <Image
            source={require("../../assets/images/avatar.jpg")}
            style={styles.avatar}
            contentFit="cover"
            accessibilityLabel="Monday Ephraim"
          />
          <View>
            <Text style={styles.name}>Monday Ephraim</Text>
            <Text style={[type.boldText, { color: colors.slate }]}>Primary: Adewole Estate</Text>
          </View>
        </View>

        <Section title="NOTIFICATION PREFERENCES" titleColor={colors.bg}>
          <Row
            icon="bellRing"
            iconWidth={20}
            title="Power Status Alerts"
            subtitle="Alerts when power returns or goes out"
            right={
              <Toggle enabled={prefs.powerStatusAlerts} onChange={toggle("powerStatusAlerts")} />
            }
          />
          <Divider />
          <Row
            icon="groups"
            iconWidth={24}
            title="Community Updates"
            subtitle="Local reports and neighborhood news"
            right={<Toggle enabled={prefs.communityUpdates} onChange={toggle("communityUpdates")} />}
          />
        </Section>

        <Section title="NEIGHBORHOOD MANAGEMENT">
          <Row
            icon="mapOutline"
            iconWidth={18}
            title="Manage Saved Neighborhoods"
            subtitle="3 locations monitored"
            onPress={() => notAvailableYet("Saved Neighborhoods")}
            right={chevron}
          />
          <Divider />
          <Row
            icon="homePin"
            iconWidth={16}
            title="Primary Location"
            subtitle="Adewole Estate"
            subtitleStyle="link"
            onPress={changeNeighborhood}
            right={<Icon name="pencil" width={18} color={colors.muted} />}
          />
        </Section>

        <Section title="APP SETTINGS">
          <Row
            icon="moon"
            iconWidth={18}
            title="Dark Mode"
            right={<Toggle enabled={prefs.darkMode} onChange={toggle("darkMode")} />}
          />
          <Divider />
          <Row
            icon="speed"
            iconWidth={20}
            title="Data Saver Mode"
            subtitle="Minimize usage on weak networks"
            right={<Toggle enabled={prefs.dataSaverMode} onChange={toggle("dataSaverMode")} />}
          />
          <Divider />
          <Row
            icon="globe"
            iconWidth={20}
            title="Language"
            subtitle="English (US)"
            onPress={() => notAvailableYet("Language")}
            right={<Icon name="translate" />}
          />
        </Section>

        <Section title={"ACCOUNT & SUPPORT"}>
          <Row
            icon="person"
            iconWidth={16}
            title="Profile Settings"
            onPress={() => notAvailableYet("Profile Settings")}
            right={chevron}
          />
          <Divider />
          <Row
            icon="helpBox"
            iconWidth={18}
            title={"Help & FAQ"}
            onPress={() => notAvailableYet("Help & FAQ")}
            right={<Icon name="openInNew" />}
          />
          <Divider />
          <Row
            icon="info"
            iconWidth={20}
            title="About PowerWatch"
            onPress={() => notAvailableYet("About PowerWatch")}
            right={chevron}
          />
        </Section>

        {/* Danger zone */}
        <View style={styles.danger}>
          <Pressable accessibilityRole="button" onPress={handleSignOut} style={styles.signOut}>
            <Icon name="logout" />
            <Text style={[type.buttonText, { color: colors.danger }]}>Sign Out</Text>
          </Pressable>
          <Text style={styles.version}>PowerWatch Version 1.0.1</Text>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  main: {
    gap: 24,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: alpha(colors.stroke, 0.6),
    borderRadius: 8,
    backgroundColor: colors.white,
    padding: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.avatarBg,
  },
  name: {
    fontFamily: fonts.hankenSemibold,
    fontSize: 20,
    lineHeight: 28,
    color: colors.ink,
  },
  section: {
    gap: 8,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: alpha(colors.stroke, 0.6),
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  rowLeft: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  subtitle: {
    fontFamily: fonts.hankenMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    color: colors.slate,
  },
  subtitleLink: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 15,
    color: colors.navy,
  },
  divider: {
    height: 1,
    marginHorizontal: 8.5,
    backgroundColor: colors.stroke,
  },
  danger: {
    gap: 24,
  },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: alpha(colors.danger, 0.2),
    borderRadius: 8,
    backgroundColor: alpha(colors.dangerTint, 0.1),
    padding: 16,
  },
  version: {
    fontFamily: fonts.hankenMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    textAlign: "center",
    color: colors.slate,
    opacity: 0.5,
  },
});

export default Profile;
