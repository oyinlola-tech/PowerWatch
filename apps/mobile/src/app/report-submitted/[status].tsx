import { Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AppHeader from "../../components/layout/AppHeader";
import Screen from "../../components/layout/Screen";
import Icon from "../../components/icons/Icon";
import type { PowerStatus } from "../../types/power";
import { fonts, shadows, type } from "../../theme";
import { makeStyles, useTheme } from "../../theme/ThemeContext";

const goHome = () => router.dismissTo("/dashboard");

// Figma "Report submitted off" (103:1509) and "Report submitted on" (103:1623)
const ReportSubmitted = () => {
  const { colors } = useTheme();
  const styles = useStyles();
  const { status, street, neighborhood, area, statusChanged } = useLocalSearchParams<{
    status: PowerStatus;
    /** Street name where the report was filed, when GPS resolved one */
    street?: string;
    /** Neighborhood where the report was filed, worked out from GPS — never the saved home area */
    neighborhood?: string;
    area?: string;
    statusChanged?: string;
  }>();

  const isOn = status === "on";
  // A report always counts for the place the GPS point resolved to, so lead with the
  // street when one is known; fall back to the neighborhood name.
  const reportedPlace = street || neighborhood || "Your area";

  return (
    <Screen header={<AppHeader back onBack={goHome} />} nav="dashboard" bottom={40}>
      {/* Success */}
      <View style={styles.success}>
        <View style={styles.circle}>
          <Icon name="userLarge" />
        </View>
        <Text accessibilityRole="header" style={[type.h1, styles.title]}>
          Report Submitted{"\n"}Successfully!
        </Text>
        <Text style={[type.boldText, styles.thanks]}>
          Thank you for helping your community stay informed.
        </Text>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <View style={styles.locationTile}>
            <Icon name="locationPinOutline" color={colors.navy} />
          </View>
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Reported Location</Text>
            <Text style={[styles.detailValue, { color: colors.ink }]}>{reportedPlace}</Text>
            {area ? <Text style={styles.detailSub}>{area}</Text> : null}
            <Text style={styles.detailSub}>Exact GPS location attached and verified</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.statusCircle}>
            <Icon name="plugOffSmall" />
          </View>
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Reported Status</Text>
            <Text style={[styles.detailValue, { color: colors.muted }]}>
              {isOn ? "Power is ON" : "Power is OFF"}
            </Text>
          </View>
        </View>
      </View>

      {/* Next steps */}
      <View style={styles.nextSteps}>
        <Text style={styles.nextTitle}>Next Steps</Text>
        <View style={styles.nextBox}>
          <View style={styles.nextIcon}>
            <Icon name="pencilSmall" color={colors.navy} />
          </View>
          <Text style={styles.nextText}>
            {statusChanged === "1"
              ? `Your report updated your neighborhood's status to Power ${isOn ? "ON" : "OFF"}. Neighbors who follow this area are being notified.`
              : "Your report has been shared. Community members in your area will verify this report shortly to ensure live accuracy."}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={goHome}
          style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
        >
          <Text style={[type.buttonText, { color: colors.white }]}>Back to Home</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            goHome();
            router.push("/my-reports");
          }}
          style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}
        >
          <Text style={[type.buttonText, { color: colors.buttonMuted }]}>View My Reports</Text>
        </Pressable>
      </View>
    </Screen>
  );
};

const useStyles = makeStyles((c) => ({
  success: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    backgroundColor: c.card,
    // Figma draws the 1px border inside the padding
    paddingTop: 23,
    paddingHorizontal: 23,
    paddingBottom: 31,
  },
  circle: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: c.primary,
  },
  title: {
    marginTop: 24,
    textAlign: "center",
    color: c.bg,
  },
  thanks: {
    marginTop: 8,
    textAlign: "center",
    color: c.muted,
    opacity: 0.9,
  },
  details: {
    marginTop: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    backgroundColor: c.card,
    padding: 19,
  },
  // Lets long location lines wrap inside the card
  detailText: {
    flex: 1,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  locationTile: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: c.tintBlue,
  },
  statusCircle: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: c.muted,
  },
  detailLabel: {
    fontFamily: fonts.segoeSemibold,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: c.muted,
  },
  detailValue: {
    fontFamily: fonts.segoeBold,
    fontSize: 18,
    lineHeight: 27,
  },
  detailSub: {
    fontFamily: fonts.segoe,
    fontSize: 14,
    lineHeight: 21,
    color: c.muted,
  },
  divider: {
    height: 1,
    backgroundColor: c.border,
  },
  nextSteps: {
    marginTop: 24,
    gap: 12,
  },
  nextTitle: {
    fontFamily: fonts.segoeSemibold,
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: c.muted,
  },
  nextBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 12,
    backgroundColor: c.gray,
    padding: 16,
  },
  nextIcon: {
    paddingTop: 2,
  },
  nextText: {
    flex: 1,
    fontFamily: fonts.segoe,
    fontSize: 14,
    lineHeight: 20,
    color: c.slate,
  },
  actions: {
    marginTop: 32,
    gap: 16,
  },
  button: {
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    boxShadow: shadows.card,
  },
  primary: {
    backgroundColor: c.primary,
  },
  secondary: {
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.gray,
  },
  pressed: {
    opacity: 0.85,
  },
}));

export default ReportSubmitted;
