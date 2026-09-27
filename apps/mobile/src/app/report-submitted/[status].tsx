import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import BackHeader from "../../components/layout/BackHeader";
import Screen from "../../components/layout/Screen";
import Icon from "../../components/icons/Icon";
import type { PowerStatus } from "../../types/power";
import { alpha, colors, fonts, shadows, type } from "../../theme";

const goHome = () => router.dismissTo("/dashboard");

// Figma "Report submitted off" (103:1509) and "Report submitted on" (103:1623)
const ReportSubmitted = () => {
  const { status, streetAddress, area } = useLocalSearchParams<{
    status: PowerStatus;
    streetAddress?: string;
    area?: string;
  }>();

  const isOn = status === "on";

  return (
    <Screen top={23} bottom={40}>
      <BackHeader height={72} onBack={goHome} />

      {/* Success */}
      <View style={styles.success}>
        <View style={styles.circle}>
          <Icon name="userLarge" />
        </View>
        <Text accessibilityRole="header" style={[type.h1, styles.title]}>
          Report Submitted{"\n"}Successfully!
        </Text>
        <Text style={[type.boldText, styles.thanks]}>
          {"Thank you for helping your community stay\ninformed."}
        </Text>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <View style={styles.locationTile}>
            <Icon name="locationPinOutline" />
          </View>
          <View>
            <Text style={styles.detailLabel}>Reported Location</Text>
            <Text style={[styles.detailValue, { color: colors.ink }]}>
              {streetAddress ?? "15 Olamide St"}
            </Text>
            <Text style={styles.detailSub}>{area ?? "Adewole Estate, Ilorin"}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={[styles.detailRow, styles.statusRow]}>
          <View style={styles.statusCircle}>
            <Icon name="plugOffSmall" />
          </View>
          <View>
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
            <Icon name="pencilSmall" />
          </View>
          <Text style={styles.nextText}>
            {
              "Your report has been shared. Community\nmembers in your area will verify this report\nshortly to ensure live accuracy."
            }
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
            router.push("/history");
          }}
          style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}
        >
          <Text style={[type.buttonText, { color: colors.buttonMuted }]}>View My Reports</Text>
        </Pressable>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  success: {
    marginTop: 21,
    marginHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: alpha(colors.stroke, 0.3),
    borderRadius: 12,
    backgroundColor: colors.white,
    // Figma draws the 1px border inside the padding
    paddingTop: 12,
    paddingHorizontal: 23,
    paddingBottom: 31,
  },
  circle: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: colors.primary,
  },
  title: {
    marginTop: 24,
    textAlign: "center",
    color: colors.bg,
  },
  thanks: {
    marginTop: 8,
    textAlign: "center",
    color: colors.muted,
    opacity: 0.9,
  },
  details: {
    marginTop: 10,
    marginHorizontal: 16,
    height: 177,
    gap: 16,
    borderWidth: 1,
    borderColor: alpha(colors.stroke, 0.3),
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: 19,
    boxShadow: shadows.card,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  statusRow: {
    marginTop: 2.5,
  },
  locationTile: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.tintBlue,
  },
  statusCircle: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: colors.muted,
  },
  detailLabel: {
    fontFamily: fonts.segoeSemibold,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.muted,
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
    color: colors.muted,
  },
  divider: {
    height: 1,
    backgroundColor: alpha(colors.stroke, 0.3),
  },
  nextSteps: {
    marginTop: 22,
    gap: 12,
    paddingHorizontal: 16,
  },
  nextTitle: {
    fontFamily: fonts.segoeSemibold,
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.muted,
  },
  nextBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 12,
    backgroundColor: colors.gray,
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
    color: colors.slate,
  },
  actions: {
    marginTop: 61,
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
  },
  button: {
    width: 322,
    maxWidth: "100%",
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    boxShadow: shadows.card,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    borderWidth: 1,
    borderColor: alpha(colors.stroke, 0.3),
    backgroundColor: colors.gray,
  },
  pressed: {
    opacity: 0.85,
  },
});

export default ReportSubmitted;
