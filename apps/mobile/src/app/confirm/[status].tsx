import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Linking, Platform, Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AppHeader from "../../components/layout/AppHeader";
import Screen from "../../components/layout/Screen";
import Icon from "../../components/icons/Icon";
import { FormError } from "../../components/ui/StateViews";
import { ApiError, locationsApi, reportsApi } from "../../services/api";
import type { ReverseGeocodeResult } from "../../services/api";
import { getExactLocation } from "../../services/location";
import type { ExactLocation } from "../../services/location";
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
    /** The off screen ends the place with a question mark */
    suffix: string;
    confirmLabel: string;
    cancelLabel: string;
    confirmColor: string;
    tileColor: string;
    iconColor: string;
  }
> => ({
  off: {
    prompt: "Is the power OFF here:",
    suffix: "?",
    confirmLabel: "Yes, Power is off",
    cancelLabel: "No, Cancel Report",
    confirmColor: colors.powerOff,
    tileColor: colors.tintBlueLight,
    iconColor: colors.bg,
  },
  on: {
    prompt: "Is the power back ON here:",
    suffix: "?",
    confirmLabel: "Yes, Power is on",
    cancelLabel: "No, still out",
    confirmColor: colors.powerOn,
    tileColor: colors.primary,
    iconColor: colors.white,
  },
});

const deviceType = Platform.OS === "ios" ? "IOS" : Platform.OS === "android" ? "ANDROID" : "WEB";

/** "Adewole Street, Bodija, Ibadan North" when a street is known, else "Bodija, Ibadan North" */
const describePlace = (place: ReverseGeocodeResult) =>
  place.road ? `${place.road}, ${place.neighborhood}, ${place.lga}` : `${place.neighborhood}, ${place.lga}`;

type LoadPhase = "locating" | "previewing" | "ready" | "error";
type ErrorKind = "denied" | "deniedForever" | "unavailable" | "mocked" | "imprecise" | "outsideNigeria" | "network" | "unknown";

interface LoadError {
  kind: ErrorKind;
  message: string;
}

// A GPS fix vaguer than this can't reliably be matched to one neighborhood (matches the server).
const MAX_ACCURACY_METERS = 200;

// Figma "Reporting power off" (57:1036) and "Reporting power on" (60:1221).
// Loading/error/permission states beyond the ready confirmation are new (no Figma frame);
// they follow the same card, spacing and button styles as the rest of this screen.
const ConfirmPowerStatus = () => {
  const { status } = useLocalSearchParams<{ status: PowerStatus }>();

  const { colors } = useTheme();
  const styles = useStyles();

  const [phase, setPhase] = useState<LoadPhase>("locating");
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [location, setLocation] = useState<ExactLocation | null>(null);
  const [place, setPlace] = useState<ReverseGeocodeResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const reportType: PowerStatus = status === "on" ? "on" : "off";
  const config = getCopy(colors)[reportType];

  /** Gets a fresh GPS fix and previews the place it resolves to. Never reuses a stale fix. */
  const load = useCallback(async () => {
    setSubmitError(null);
    setLoadError(null);
    setPlace(null);
    setPhase("locating");

    const gps = await getExactLocation();
    if (!gps.ok) {
      if (gps.reason === "denied") {
        setLocation(null);
        setLoadError(
          gps.canAskAgain
            ? {
                kind: "denied",
                message: "PowerWatch needs your location to file a report. Allow location access and try again.",
              }
            : {
                kind: "deniedForever",
                message: "Location access is off for PowerWatch. Turn it on in Settings, then try again.",
              },
        );
      } else {
        setLocation(null);
        setLoadError({
          kind: "unavailable",
          message: "Couldn't get a precise location. Move to an open spot or check that location services are on, then try again.",
        });
      }
      setPhase("error");
      return;
    }

    setLocation(gps.location);

    if (gps.location.mocked) {
      setLoadError({
        kind: "mocked",
        message: "Your phone says its location is being simulated. Turn off any mock location app, then try again.",
      });
      setPhase("error");
      return;
    }

    if (gps.location.accuracy > MAX_ACCURACY_METERS) {
      setLoadError({
        kind: "imprecise",
        message: "Your location isn't precise enough to report. Move to an open spot or turn on high-accuracy location, then try again.",
      });
      setPhase("error");
      return;
    }

    setPhase("previewing");
    try {
      const found = await locationsApi.reverseGeocode(gps.location.latitude, gps.location.longitude);
      setPlace(found);
      setPhase("ready");
    } catch (e) {
      if (e instanceof ApiError && e.status === 422) {
        setLoadError({ kind: "outsideNigeria", message: e.message });
      } else if (e instanceof ApiError && e.isNetworkError) {
        setLoadError({ kind: "network", message: "Couldn't confirm your area. Check your connection and try again." });
      } else {
        setLoadError({
          kind: "unknown",
          message: e instanceof ApiError ? e.message : "Couldn't confirm your area. Please try again.",
        });
      }
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const handleConfirm = async () => {
    if (!location || !place) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await reportsApi.report(
        reportType === "on" ? "ON" : "OFF",
        { latitude: location.latitude, longitude: location.longitude, accuracy: location.accuracy, mocked: location.mocked },
        { deviceType },
      );
      mixpanel.track("power_reported", { status: reportType, statusChanged: result.statusChanged });
      router.replace({
        pathname: "/report-submitted/[status]",
        params: {
          status: reportType,
          street: result.place.street ?? "",
          neighborhood: result.place.neighborhood,
          area: [result.place.town, result.place.lga, result.place.state].filter(Boolean).join(", "),
          statusChanged: result.statusChanged ? "1" : "0",
        },
      });
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : "Couldn't send your report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const loadingLabel = phase === "previewing" ? "Matching your location to your area…" : "Finding your location…";

  return (
    <Screen header={<AppHeader back />} bottom={40}>
      <View style={styles.card}>
        <View style={[styles.tile, { backgroundColor: config.tileColor }]}>
          <Icon name="plugOffLarge" color={config.iconColor} />
        </View>

        <Text accessibilityRole="header" style={[type.h1, styles.title]}>
          Confirm Power{"\n"}Status
        </Text>

        {phase === "ready" && place ? (
          <>
            <Text style={styles.prompt}>
              {config.prompt}{" "}
              <Text style={{ fontFamily: fonts.semibold }}>
                {describePlace(place)}
                {config.suffix}
              </Text>
            </Text>

            <View style={styles.actions}>
              <FormError message={submitError} />
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
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={[styles.buttonLabel, { color: colors.white }]}>{config.confirmLabel}</Text>
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={goBack}
                style={({ pressed }) => [styles.button, styles.cancel, pressed && styles.pressed]}
              >
                <Text style={[styles.buttonLabel, { color: colors.bg, opacity: 0.7 }]}>{config.cancelLabel}</Text>
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
          </>
        ) : phase === "error" && loadError ? (
          <View style={styles.stateBlock}>
            <Icon name="infoCircle" color={colors.danger} />
            <Text style={styles.stateMessage}>{loadError.message}</Text>

            <View style={styles.actions}>
              {loadError.kind === "deniedForever" && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void Linking.openSettings()}
                  style={({ pressed }) => [styles.button, { backgroundColor: colors.primary }, pressed && styles.pressed]}
                >
                  <Text style={[styles.buttonLabel, { color: colors.white }]}>Open Settings</Text>
                </Pressable>
              )}
              <Pressable
                accessibilityRole="button"
                onPress={() => void load()}
                style={({ pressed }) => [
                  styles.button,
                  loadError.kind === "deniedForever" ? styles.cancel : { backgroundColor: colors.primary },
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.buttonLabel,
                    { color: loadError.kind === "deniedForever" ? colors.bg : colors.white },
                  ]}
                >
                  Try Again
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={goBack}
                style={({ pressed }) => [styles.button, styles.cancel, pressed && styles.pressed]}
              >
                <Text style={[styles.buttonLabel, { color: colors.bg, opacity: 0.7 }]}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.stateBlock}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.stateMessage}>{loadingLabel}</Text>
          </View>
        )}
      </View>
    </Screen>
  );
};

const useStyles = makeStyles((c) => ({
  card: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 24,
    backgroundColor: c.card,
    padding: 23,
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
    marginTop: 12,
    maxWidth: 280,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: c.bg,
  },
  stateBlock: {
    marginTop: 32,
    alignSelf: "stretch",
    alignItems: "center",
    gap: 12,
  },
  stateMessage: {
    maxWidth: 280,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: c.bg,
    opacity: 0.85,
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
    borderColor: c.border,
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
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0.14,
    color: c.slate,
    opacity: 0.7,
  },
  noteWarning: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 15,
    color: c.slate,
  },
}));

export default ConfirmPowerStatus;
