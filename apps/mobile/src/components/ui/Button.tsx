import { ActivityIndicator, Pressable, Text } from "react-native";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { shadows, type } from "../../theme";
import { makeStyles, useTheme } from "../../theme/ThemeContext";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  /** `primary` is the blue button; `secondary` the gray outlined one */
  variant?: "primary" | "secondary";
  height?: number;
  shadow?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  /** Shows a spinner and ignores presses while a request is running */
  loading?: boolean;
  disabled?: boolean;
}

const Button = ({
  label,
  onPress,
  variant = "primary",
  height = 56,
  shadow = false,
  style,
  labelStyle,
  loading = false,
  disabled = false,
}: ButtonProps) => {
  const { colors } = useTheme();
  const styles = useStyles();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { height },
        variant === "primary" ? styles.primary : styles.secondary,
        shadow && { boxShadow: shadows.card },
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.white : colors.accent} />
      ) : (
      <Text
        style={[
          type.buttonText,
          styles.label,
          { color: variant === "primary" ? colors.white : colors.accent },
          labelStyle,
        ]}
      >
        {label}
      </Text>
      )}
    </Pressable>
  );
};

const useStyles = makeStyles((c) => ({
  button: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  },
  primary: {
    backgroundColor: c.primary,
  },
  secondary: {
    borderWidth: 1,
    borderColor: c.borderButton,
    backgroundColor: c.gray,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    textAlign: "center",
  },
}));

export default Button;
