import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import BackHeader from "../../components/layout/BackHeader";
import Screen from "../../components/layout/Screen";
import Icon from "../../components/icons/Icon";
import { FormError } from "../../components/ui/StateViews";
import { useUser } from "../../context/AuthContext";
import { ApiError, reportsApi } from "../../services/api";
import { getExactLocation } from "../../services/location";
import mixpanel from "../../services/mixpanel";
import { goBack } from "../../services/navigation";
import type { PowerStatus } from "../../types/power";
import { alpha, fonts, shadows, type } from "../../theme";
import type { Palette } from "../../theme";
import { makeStyles, useTheme } from "../../theme/ThemeContext";

const getCopy = (colors: Palette): Record<
  PowerStatus,
  {
    prompt: string;
    /** The off screen ends the neighborhood with a question mark */
    suffix: string;
    confirmLabel: string;
    cancelLabel: string;
    confirmColor: string;
    tileColor: string;
    iconColor: string;
  }
> => ({
  off: {
    prompt: "Are you currently experiencing a power outage at your location in",
    suffix: "?",
    confirmLabel: "Yes, Power is off",
    cancelLabel: "No, Cancel Report",
    confirmColor: colors.powerOff,
    tileColor: colors.tintBlueLight,
    iconColor: colors.bg,
  },
  on: {
    prompt: "Please confirm if electricity has been restored at your location in",
    suffix: "",
    confirmLabel: "Yes, Power is on",
    cancelLabel: "No, still out",
    confirmColor: colors.powerOn,
    tileColor: colors.primary,
    iconColor: colors.white,
  },
});

const deviceType = Platform.OS === "ios" ? "IOS" : Platform.OS === "android" ? "ANDROID" : "WEB";

// Figma "Reporting power off" (57:1036) and "Reporting power on" (60:1221)
const ConfirmPowerStatus = () => {
  const { status } = useLocalSearchParams<{ status: PowerStatus }>();

  const user = useUser();
  const { colors } = useTheme();
  const styles = useStyles();
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportType: PowerStatus = status === "on" ? "on" : "off";
  const config = getCopy(colors)[reportType];
  const neighborhood = user.neighborhood?.name ?? "your neighborhood";
  const area = [user.town?.name, user.lga?.name].filter(Boolean).join(", ");

  const handleConfirm = async () => {
    if (!user.neighborhoodId) {
      setError("Set your monitoring area first (Home > Change).");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Every report carries the exact spot it was made from (when the phone allows it)
      setLocating(true);
      const gps = await getExactLocation();
      setLocating(false);

      const result = await reportsApi.report(reportType === "on" ? "ON" : "OFF", user.neighborhoodId, {
        deviceType,
        ...(gps.ok ? { location: gps.location } : {}),
      });
      mixpanel.track("power_reported", {
        status: reportType,
        statusChanged: result.statusChanged,
        withLocation: gps.ok,
      });
      router.replace({
        pathname: "/report-submitted/[status]",
        params: {
          status: reportType,
          streetAddress: neighborhood,
          area,
          statusChanged: result.statusChanged ? "1" : "0",
          located: gps.ok ? "1" : gps.reason,
        },
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't send your report. Please try again.");
    } finally {
      setLocating(false);
      setSubmitting(false);
    }
  };

  return (
    <Screen top={23} bottom={40}>
      <BackHeader height={72} />

      <View style={styles.card}>
        <View style={[styles.tile, { backgroundColor: config.tileColor }]}>
          <Icon name="plugOffLarge" color={config.iconColor} />
        </View>

        <Text accessibilityRole="header" style={[type.h1, styles.title]}>
          Confirm Power{"\n"}Status
        </Text>

        <Text style={styles.prompt}>
          {config.prompt}{" "}
          <Text style={{ fontFamily: fonts.semibold }}>
            {neighborhood}
            {config.suffix}
          </Text>
        </Text>

        <View style={styles.actions}>
          <FormError message={error} />
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: submitting, disabled: submitting }}
            onPress={handleConfirm}
            disabled={submitting}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: config.confirmColor, boxShadow: shadows.raised("#1E3A8A") },
              pressed && styles.pressed,
            ]}
          >
            {submitting ? (
              <View style={styles.busy}>
                <ActivityIndicator color={colors.white} />
                {locating && <Text style={[styles.buttonLabel, { color: colors.white }]}>Getting location…</Text>}
              </View>
            ) : (
              <Text style={[styles.buttonLabel, { color: colors.white }]}>{config.confirmLabel}</Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={goBack}
            style={({ pressed }) => [styles.button, styles.cancel, pressed && styles.pressed]}
          >
            <Text style={[styles.buttonLabel, { color: colors.bg, opacity: 0.7 }]}>
              {config.cancelLabel}
            </Text>
          </Pressable>
        </View>

        <View style={styles.note}>
          <View style={styles.noteIcon}>
            <Icon name="infoCircle" color={colors.accent} />
          </View>
          <View style={styles.noteText}>
            <Text style={styles.noteBody}>Your report helps neighbors stay informed.</Text>
            <Text style={styles.noteBody}>Your exact location is attached to verify the report.</Text>
            <Text style={styles.noteWarning}>False reports may affect community standing.</Text>
          </View>
        </View>
      </View>
    </Screen>
  );
};

const useStyles = makeStyles((c) => ({
  busy: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  card: {
    marginTop: 60,
    width: 327,
    maxWidth: "100%",
    alignSelf: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: c.borderSoft,
    borderRadius: 24,
    backgroundColor: c.card,
    // Figma draws the 1px border inside the 32px padding
    padding: 31,
    boxShadow: shadows.sheet,
  },
  tile: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  title: {
    marginTop: 32,
    textAlign: "center",
    color: c.bg,
  },
  prompt: {
    marginTop: 11.75,
    width: 229,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 17,
    textAlign: "center",
    color: c.bg,
  },
  actions: {
    marginTop: 40,
    alignSelf: "stretch",
    gap: 12,
  },
  button: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  },
  cancel: {
    borderWidth: 1.5,
    borderColor: alpha(c.bg, 0.1),
    backgroundColor: c.gray,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 19,
    textAlign: "center",
    textTransform: "uppercase",
  },
  note: {
    marginTop: 40,
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: c.borderSoft,
    borderRadius: 12,
    backgroundColor: c.surfaceNote,
    padding: 15,
  },
  noteIcon: {
    paddingTop: 2,
  },
  noteText: {
    flex: 1,
    gap: 4,
  },
  noteBody: {
    width: 190,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0.14,
    color: c.slate,
    opacity: 0.7,
  },
  noteWarning: {
    width: 196,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 15,
    color: c.slate,
  },
}));

export default ConfirmPowerStatus;
