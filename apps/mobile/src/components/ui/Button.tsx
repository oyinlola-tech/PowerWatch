import { Pressable, StyleSheet, Text } from "react-native";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { colors, shadows, type } from "../../theme";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  /** `primary` is the blue button; `secondary` the gray outlined one */
  variant?: "primary" | "secondary";
  height?: number;
  shadow?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

const Button = ({
  label,
  onPress,
  variant = "primary",
  height = 56,
  shadow = false,
  style,
  labelStyle,
}: ButtonProps) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [
      styles.button,
      { height },
      variant === "primary" ? styles.primary : styles.secondary,
      shadow && { boxShadow: shadows.card },
      pressed && styles.pressed,
      style,
    ]}
  >
    <Text
      style={[
        type.buttonText,
        styles.label,
        { color: variant === "primary" ? colors.white : colors.primary },
        labelStyle,
      ]}
    >
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    borderWidth: 1,
    borderColor: colors.borderButton,
    backgroundColor: colors.gray,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    textAlign: "center",
  },
});

export default Button;
