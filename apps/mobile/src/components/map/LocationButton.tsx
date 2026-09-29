import { Alert, Linking, Pressable, Text } from "react-native";
import Icon from "../icons/Icon";
import { fonts, shadows } from "../../theme";
import { makeStyles, useTheme } from "../../theme/ThemeContext";
import type { UserLocationState } from "../../hooks/useUserLocation";

interface LocationButtonProps {
  location: UserLocationState;
  /** Called with the current position when the person taps "center on me" */
  onCenter: (position: NonNullable<UserLocationState["position"]>) => void;
}

/**
 * Map control, bottom-right like the location picker's "Use current location". Without
 * permission it reads "Show my location" and asks (or explains, and offers Settings when the
 * phone won't prompt again). With a fix it becomes a "center on me" button.
 */
const LocationButton = ({ location, onCenter }: LocationButtonProps) => {
  const { colors } = useTheme();
  const styles = useStyles();
  const { position, permission, canAskAgain, locating } = location;

  if (permission === "granted" && position) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Center the map on my location"
        onPress={() => onCenter(position)}
        style={({ pressed }) => [styles.button, styles.iconOnly, pressed && { opacity: 0.85 }]}
      >
        <Icon name="locate" color={colors.accent} />
      </Pressable>
    );
  }

  const onPress = async () => {
    if (permission === "denied" && !canAskAgain) {
      Alert.alert(
        "Location is turned off",
        "To show where you are on the map, allow location for PowerWatch in Settings. Your position stays on your phone and is only drawn on the map.",
        [
          { text: "Not Now", style: "cancel" },
          { text: "Open Settings", onPress: () => void Linking.openSettings() },
        ],
      );
      return;
    }
    await location.request();
  };

  const label = permission === "granted" ? (locating ? "Locating..." : "Try again") : "Show my location";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={locating}
      onPress={() => void onPress()}
      style={({ pressed }) => [styles.button, locating && { opacity: 0.6 }, pressed && { opacity: 0.85 }]}
    >
      <Icon name="locate" color={colors.accent} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};

const useStyles = makeStyles((c) => ({
  button: {
    position: "absolute",
    right: 12,
    bottom: 12,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: c.borderInput,
    borderRadius: 8,
    backgroundColor: c.card,
    paddingHorizontal: 16,
    boxShadow: shadows.card,
  },
  iconOnly: {
    width: 40,
    justifyContent: "center",
    paddingHorizontal: 0,
  },
  label: {
    fontFamily: fonts.segoe,
    fontSize: 12,
    lineHeight: 16,
    color: c.black,
  },
}));

export default LocationButton;
