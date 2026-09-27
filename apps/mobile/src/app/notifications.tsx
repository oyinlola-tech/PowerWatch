import { useEffect, useState } from "react";
import { Platform, Text, View } from "react-native";
import LogoHeader from "../components/layout/LogoHeader";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import type { GlyphName } from "../components/icons/glyphs";
import Button from "../components/ui/Button";
import Toggle from "../components/ui/Toggle";
import { FormError } from "../components/ui/StateViews";
import { useAuth } from "../context/AuthContext";
import { ApiError, authApi } from "../services/api";
import { goToDashboard } from "../services/navigation";
import {
  getNotificationPermission,
  registerForPushNotifications,
  requestNotificationPermission,
} from "../services/notifications";
import type { NotificationPermission } from "../services/notifications";
import { fonts, type } from "../theme";
import { makeStyles, useTheme } from "../theme/ThemeContext";

interface OptionProps {
  icon: GlyphName;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}

const Option = ({ icon, title, description, enabled, onChange }: OptionProps) => {
  const { colors } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.option}>
      <View style={styles.optionText}>
        <View style={styles.optionTitle}>
          <View style={styles.optionIcon}>
            <Icon name={icon} color={colors.accent} />
          </View>
          <Text style={[type.boldText, { color: colors.black }]}>{title}</Text>
        </View>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>

      <Toggle
        enabled={enabled}
        onChange={onChange}
        offColor={colors.border}
        offBorderColor={colors.borderInput}
      />
    </View>
  );
};

// Figma "Onboarding - Notifications" (3:332)
const NotificationSetup = () => {
  const { colors } = useTheme();
  const styles = useStyles();
  const { user, setUser } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prefs, setPrefs] = useState({
    outageAlerts: true,
    restorationAlerts: true,
    communityReports: false,
  });

  useEffect(() => {
    let isMounted = true;
    getNotificationPermission().then((status) => {
      if (isMounted) setPermissionStatus(status);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const updatePref = (key: keyof typeof prefs) => (value: boolean) =>
    setPrefs((prev) => ({ ...prev, [key]: value }));

  const handleFinishSetup = async () => {
    setSaving(true);
    setError(null);
    try {
      const saved = await authApi.updateNotificationPreferences({
        notificationEnabled: true,
        outageAlerts: prefs.outageAlerts,
        restorationAlerts: prefs.restorationAlerts,
        communityUpdates: prefs.communityReports,
      });
      if (user) setUser({ ...user, ...saved });

      const wantsAlerts = prefs.outageAlerts || prefs.restorationAlerts || prefs.communityReports;
      let permission = permissionStatus;
      // Push alerts only exist in the phone apps; don't prompt in a browser
      if (wantsAlerts && permission === "default" && Platform.OS !== "web") {
        permission = await requestNotificationPermission();
        setPermissionStatus(permission);
      }
      // Best effort: builds without push credentials still finish setup
      if (permission === "granted") await registerForPushNotifications();

      goToDashboard();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't save your preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen top={40} bottom={24} contentStyle={styles.content}>
      <LogoHeader />

      {/* Title */}
      <View style={styles.titleBlock}>
        <Text accessibilityRole="header" style={[type.h1, { color: colors.bg }]}>
          Stay updated
        </Text>
        <Text style={[type.boldText, styles.subtitle]}>
          {"Get notified immediately when there is a\nchange in your neighborhood's power status."}
        </Text>
      </View>

      {/* Preview */}
      <View style={styles.preview}>
        <Icon name="bell" color={colors.borderInput} />
        <Text style={styles.previewLabel}>Notification Preview</Text>
      </View>

      {/* Options */}
      <View style={styles.options}>
        <Option
          icon="boltSmall"
          title="Outage Alerts"
          description="Be the first to know when power goes out."
          enabled={prefs.outageAlerts}
          onChange={updatePref("outageAlerts")}
        />
        <Option
          icon="bullhorn"
          title="Restoration Alerts"
          description="Get notified as soon as power is back on."
          enabled={prefs.restorationAlerts}
          onChange={updatePref("restorationAlerts")}
        />
        <Option
          icon="mapLocation"
          title="Community Reports"
          description={"See real-time updates from your\nneighbors."}
          enabled={prefs.communityReports}
          onChange={updatePref("communityReports")}
        />
      </View>

      <FormError message={error} style={styles.error} />

      <Button label="Finish Setup" onPress={handleFinishSetup} loading={saving} style={styles.finish} />
    </Screen>
  );
};

const useStyles = makeStyles((c) => ({
  error: {
    marginTop: 16,
  },
  content: {
    paddingHorizontal: 24,
  },
  titleBlock: {
    marginTop: 28,
    gap: 8,
  },
  subtitle: {
    color: c.gray600,
    opacity: 0.7,
  },
  preview: {
    marginTop: 28,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    gap: 13.5,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 16,
    backgroundColor: c.borderLight,
  },
  previewLabel: {
    fontFamily: fonts.segoe,
    fontSize: 12,
    lineHeight: 16,
    color: c.gray400,
  },
  options: {
    marginTop: 28,
    gap: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    backgroundColor: c.card,
    // Figma draws the 1px border inside the 16px padding
    padding: 15,
  },
  optionText: {
    flexShrink: 1,
    gap: 4,
    paddingRight: 16,
  },
  optionTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionIcon: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  optionDescription: {
    fontFamily: fonts.segoe,
    fontSize: 12,
    lineHeight: 16,
    color: c.gray500,
  },
  finish: {
    marginTop: 85,
  },
}));

export default NotificationSetup;
