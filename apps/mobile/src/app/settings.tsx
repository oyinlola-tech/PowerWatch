import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { router } from "expo-router";
import AppHeader from "../components/layout/AppHeader";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import { Chevron, Divider, Row, Section } from "../components/ui/ListSection";
import Toggle from "../components/ui/Toggle";
import { useAuth, useUser } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { ApiError, authApi, locationsApi } from "../services/api";
import type { NotificationPreferences } from "../services/api";
import { changeNeighborhood } from "../services/navigation";
import { fullName, initials } from "../utils/format";
import { alpha, fonts, type } from "../theme";
import { makeStyles, useTheme } from "../theme/ThemeContext";

const APP_SETTINGS_KEY = "pw.appSettings";

const chevron = <Chevron />;

// Figma "Profile" (143:217)
const Profile = () => {
  const user = useUser();
  const { setUser, signOut } = useAuth();
  const saved = useApi(locationsApi.saved);
  const { colors, isDark, setDarkMode } = useTheme();
  const styles = useStyles();

  // Device-only display settings
  const [appSettings, setAppSettings] = useState({ dataSaverMode: true });
  useEffect(() => {
    AsyncStorage.getItem(APP_SETTINGS_KEY)
      .then((raw) => raw && setAppSettings((s) => ({ ...s, ...JSON.parse(raw) })))
      .catch(() => {});
  }, []);
  const toggleApp = (key: keyof typeof appSettings) => (value: boolean) =>
    setAppSettings((prev) => {
      const next = { ...prev, [key]: value };
      void AsyncStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(next));
      return next;
    });

  // Notification preferences live on the server; update optimistically
  const updatePrefs = async (changes: Partial<NotificationPreferences>) => {
    const previous = user;
    setUser({ ...user, ...changes });
    try {
      const prefs = await authApi.updateNotificationPreferences(changes);
      setUser({ ...user, ...prefs });
    } catch (error) {
      setUser(previous);
      Alert.alert(
        "Couldn't update notifications",
        error instanceof ApiError ? error.message : "Please try again.",
      );
    }
  };
  const powerAlertsOn = user.notificationEnabled && (user.outageAlerts || user.restorationAlerts);

  const handleSignOut = () =>
    Alert.alert("Sign out?", "You'll stop getting power alerts on this phone until you log in again.", [
      { text: "Cancel", style: "cancel" },
      // The auth guard returns the app to the start once signed out
      { text: "Sign Out", style: "destructive", onPress: () => void signOut() },
    ]);

  const savedCount = saved.data?.length;
  const primaryName = user.neighborhood?.name ?? "Not set";
  const version = Constants.expoConfig?.version ?? "1.0.1";

  return (
    <Screen
      header={<AppHeader back />}
      nav="settings"
      onRefresh={saved.refresh}
      refreshing={saved.refreshing}
    >
      <View style={styles.main}>
        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.avatar} accessibilityLabel={fullName(user)}>
            <Text style={styles.avatarText}>{initials(user)}</Text>
          </View>
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {fullName(user)}
            </Text>
            <Text style={[type.boldText, { color: colors.slate }]} numberOfLines={1}>
              Primary: {primaryName}
            </Text>
          </View>
        </View>

        <Section title="NOTIFICATION PREFERENCES" titleColor={colors.bg}>
          <Row
            icon="bellRing"
            iconWidth={20}
            title="Power Status Alerts"
            subtitle="Alerts when power returns or goes out"
            right={
              <Toggle
                enabled={powerAlertsOn}
                onChange={(on) =>
                  void updatePrefs(
                    on
                      ? { notificationEnabled: true, outageAlerts: true, restorationAlerts: true }
                      : { outageAlerts: false, restorationAlerts: false },
                  )
                }
              />
            }
          />
          <Divider />
          <Row
            icon="groups"
            iconWidth={24}
            title="Community Updates"
            subtitle="Local reports and neighborhood news"
            right={
              <Toggle
                enabled={user.notificationEnabled && user.communityUpdates}
                onChange={(on) =>
                  void updatePrefs(on ? { notificationEnabled: true, communityUpdates: true } : { communityUpdates: false })
                }
              />
            }
          />
        </Section>

        <Section title="NEIGHBORHOOD MANAGEMENT">
          <Row
            icon="mapOutline"
            iconWidth={18}
            title="Manage Saved Neighborhoods"
            subtitle={
              savedCount === undefined
                ? "Follow more places"
                : `${savedCount} ${savedCount === 1 ? "location" : "locations"} monitored`
            }
            onPress={() => router.push("/saved-neighborhoods")}
            right={chevron}
          />
          <Divider />
          <Row
            icon="homePin"
            iconWidth={16}
            title="Primary Location"
            subtitle={primaryName}
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
            right={<Toggle enabled={isDark} onChange={setDarkMode} />}
          />
          <Divider />
          <Row
            icon="speed"
            iconWidth={20}
            title="Data Saver Mode"
            subtitle="Minimize usage on weak networks"
            right={<Toggle enabled={appSettings.dataSaverMode} onChange={toggleApp("dataSaverMode")} />}
          />
          <Divider />
          <Row
            icon="globe"
            iconWidth={20}
            title="Language"
            subtitle="English (US)"
            onPress={() => router.push("/language")}
            right={<Icon name="translate" color={colors.muted} />}
          />
        </Section>

        <Section title={"ACCOUNT & SUPPORT"}>
          <Row
            icon="person"
            iconWidth={16}
            title="Profile Settings"
            onPress={() => router.push("/profile-settings")}
            right={chevron}
          />
          <Divider />
          <Row
            icon="navReports"
            iconWidth={18}
            iconColor={colors.slateIcon}
            title="My Reports"
            onPress={() => router.push("/my-reports")}
            right={chevron}
          />
          <Divider />
          <Row
            icon="locate"
            iconWidth={18}
            iconColor={colors.slateIcon}
            title="Signed-in Devices"
            subtitle="See and sign out other devices"
            onPress={() => router.push("/devices")}
            right={chevron}
          />
          <Divider />
          <Row
            icon="helpBox"
            iconWidth={18}
            title={"Help & FAQ"}
            onPress={() => router.push("/help")}
            right={chevron}
          />
          <Divider />
          <Row
            icon="info"
            iconWidth={20}
            title="About PowerWatch"
            onPress={() => router.push("/about")}
            right={chevron}
          />
        </Section>

        {/* Danger zone */}
        <View style={styles.danger}>
          <Pressable accessibilityRole="button" onPress={handleSignOut} style={styles.signOut}>
            <Icon name="logout" color={colors.danger} />
            <Text style={[type.buttonText, { color: colors.danger }]}>Sign Out</Text>
          </Pressable>
          <Text style={styles.version}>PowerWatch Version {version}</Text>
        </View>
      </View>
    </Screen>
  );
};

const useStyles = makeStyles((c) => ({
  main: {
    gap: 24,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 8,
    backgroundColor: c.card,
    padding: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: c.avatarBg,
  },
  avatarText: {
    fontFamily: fonts.hankenSemibold,
    fontSize: 20,
    lineHeight: 28,
    color: c.navy,
  },
  name: {
    fontFamily: fonts.hankenSemibold,
    fontSize: 20,
    lineHeight: 28,
    color: c.ink,
  },
  danger: {
    gap: 24,
  },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: alpha(c.danger, 0.2),
    borderRadius: 8,
    backgroundColor: alpha(c.dangerTint, 0.1),
    padding: 16,
  },
  version: {
    fontFamily: fonts.hankenMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    textAlign: "center",
    color: c.slate,
    opacity: 0.5,
  },
}));

export default Profile;
