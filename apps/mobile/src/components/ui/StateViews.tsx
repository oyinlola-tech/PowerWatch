import { ActivityIndicator, Pressable, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Icon from "../icons/Icon";
import type { GlyphName } from "../icons/glyphs";
import { alpha, fonts, type } from "../../theme";
import { makeStyles, useTheme } from "../../theme/ThemeContext";

interface BoxProps {
  style?: StyleProp<ViewStyle>;
}

export const LoadingView = ({ style, label }: BoxProps & { label?: string }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={[styles.box, style]} accessibilityLabel={label ?? "Loading"}>
      <ActivityIndicator color={colors.accent} />
      {label && <Text style={styles.body}>{label}</Text>}
    </View>
  );
};

export const ErrorView = ({
  message,
  onRetry,
  style,
}: BoxProps & { message: string; onRetry?: () => void }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={[styles.box, style]}>
      <Icon name="infoCircle" color={colors.danger} />
      <Text style={styles.body}>{message}</Text>
      {onRetry && (
        <Pressable accessibilityRole="button" onPress={onRetry} hitSlop={8}>
          <Text style={[type.boldText, { color: colors.accent }]}>Try again</Text>
        </Pressable>
      )}
    </View>
  );
};

export const EmptyView = ({
  icon = "info",
  title,
  message,
  style,
}: BoxProps & { icon?: GlyphName; title: string; message?: string }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={[styles.box, style]}>
      <Icon name={icon} color={colors.gray400} />
      <Text style={[type.boldText, { color: colors.bg, textAlign: "center" }]}>{title}</Text>
      {message && <Text style={styles.body}>{message}</Text>}
    </View>
  );
};

/** Form-level error, e.g. "Invalid email or password." */
export const FormError = ({ message, style }: BoxProps & { message?: string | null }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  return message ? (
    <View accessibilityLiveRegion="polite" style={[styles.formError, style]}>
      <Icon name="infoCircle" color={colors.danger} width={16} />
      <Text style={styles.formErrorText}>{message}</Text>
    </View>
  ) : null;
};

const useStyles = makeStyles((c) => ({
  box: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: c.gray600,
  },
  formError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: alpha(c.danger, 0.2),
    borderRadius: 8,
    backgroundColor: alpha(c.dangerTint, 0.4),
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  formErrorText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: c.danger,
  },
}));
