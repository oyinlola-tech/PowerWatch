import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import BackHeader from "../../components/layout/BackHeader";
import Screen from "../../components/layout/Screen";
import Icon from "../../components/icons/Icon";
import { goBack } from "../../services/navigation";
import type { PowerStatus } from "../../types/power";
import { alpha, colors, fonts, shadows, type } from "../../theme";

const copy: Record<
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
> = {
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
};

const neighborhood = "Adewole Estate";

// Figma "Reporting power off" (57:1036) and "Reporting power on" (60:1221)
const ConfirmPowerStatus = () => {
  const { status } = useLocalSearchParams<{ status: PowerStatus }>();

  const reportType: PowerStatus = status === "on" ? "on" : "off";
  const config = copy[reportType];

  const handleConfirm = () => {
    // TODO: submit report to backend with reportType + neighborhood
    router.push({
      pathname: "/report-submitted/[status]",
      params: {
        status: reportType,
        streetAddress: "15 Olamide St", // pull from actual user address once you have it
        area: `${neighborhood}, Ilorin`,
      },
    });
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
          <Pressable
            accessibilityRole="button"
            onPress={handleConfirm}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: config.confirmColor, boxShadow: shadows.raised("#1E3A8A") },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.buttonLabel, { color: colors.white }]}>{config.confirmLabel}</Text>
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
            <Icon name="infoCircle" />
          </View>
          <View style={styles.noteText}>
            <Text style={styles.noteBody}>Your report helps neighbors stay informed.</Text>
            <Text style={styles.noteWarning}>False reports may affect community standing.</Text>
          </View>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 60,
    width: 327,
    maxWidth: "100%",
    alignSelf: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 24,
    backgroundColor: colors.white,
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
    color: colors.bg,
  },
  prompt: {
    marginTop: 11.75,
    width: 229,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 17,
    textAlign: "center",
    color: colors.bg,
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
    borderColor: alpha(colors.bg, 0.1),
    backgroundColor: colors.gray,
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
    borderColor: colors.borderSoft,
    borderRadius: 12,
    backgroundColor: colors.surfaceNote,
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
    color: colors.slate,
    opacity: 0.7,
  },
  noteWarning: {
    width: 196,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 15,
    color: colors.slate,
  },
});

export default ConfirmPowerStatus;
