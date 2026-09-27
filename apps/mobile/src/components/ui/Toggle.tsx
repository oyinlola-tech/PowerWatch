import { useEffect, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet } from "react-native";
import { shadows } from "../../theme";
import { useTheme } from "../../theme/ThemeContext";

interface ToggleProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
  /** Track colour when off: `#E5E7EB` with a border in onboarding, `#C3C6D4` in the profile */
  offColor?: string;
  offBorderColor?: string;
}

// 48x24 track with a 16px knob, 4px inset
const Toggle = ({ enabled, onChange, offColor: offColorProp, offBorderColor }: ToggleProps) => {
  const { colors } = useTheme();
  const offColor = offColorProp ?? colors.stroke;
  const progress = useState(() => new Animated.Value(enabled ? 1 : 0))[0];

  useEffect(() => {
    Animated.timing(progress, {
      toValue: enabled ? 1 : 0,
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [enabled, progress]);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
      onPress={() => onChange(!enabled)}
      hitSlop={8}
    >
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [offColor, colors.primary],
            }),
            borderColor: offBorderColor
              ? progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [offBorderColor, colors.primary],
                })
              : "transparent",
            borderWidth: offBorderColor ? 1 : 0,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.knob,
            {
              left: offBorderColor ? 3 : 4,
              transform: [
                { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 24] }) },
              ],
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 24,
    justifyContent: "center",
    borderRadius: 9999,
  },
  knob: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 9999,
    // The knob stays white on both tracks and in both themes
    backgroundColor: "#FFFFFF",
    boxShadow: shadows.card,
  },
});

export default Toggle;
