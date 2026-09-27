import type { ReactNode } from "react";
import { Text, TextInput, View } from "react-native";
import type { StyleProp, TextInputProps, ViewStyle } from "react-native";
import Icon from "../icons/Icon";
import type { GlyphName } from "../icons/glyphs";
import { fonts, type } from "../../theme";
import { makeStyles, useTheme } from "../../theme/ThemeContext";

interface TextFieldProps extends Omit<TextInputProps, "style"> {
  label: string;
  icon: GlyphName;
  /** Input outline: Primary on the login screen, `#E5E7EB` on sign up */
  borderColor?: string;
  /** Gap between label and input: 8 on login, 6 on sign up */
  labelGap?: number;
  labelRight?: ReactNode;
  right?: ReactNode;
  hint?: string;
  /** Validation message; also turns the outline red */
  error?: string | undefined;
  containerStyle?: StyleProp<ViewStyle>;
}

const TextField = ({
  label,
  icon,
  borderColor: borderColorProp,
  labelGap = 8,
  labelRight,
  right,
  hint,
  error,
  containerStyle,
  ...input
}: TextFieldProps) => {
  const { colors, isDark } = useTheme();
  const styles = useStyles();
  const borderColor = borderColorProp ?? colors.border;

  return (
    <View style={containerStyle}>
      <View style={[styles.labelRow, { marginBottom: labelGap }]}>
        <Text style={[type.boldText, { color: colors.gray700 }]}>{label}</Text>
        {labelRight}
      </View>

      <View style={[styles.field, { borderColor: error ? colors.danger : borderColor }]}>
        <View style={styles.icon}>
          <Icon name={icon} color={colors.gray400} />
        </View>

        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.gray400}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardAppearance={isDark ? "dark" : "light"}
          {...input}
          style={styles.input}
        />

        {right}
      </View>

      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : (
        hint && <Text style={styles.hint}>{hint}</Text>
      )}
    </View>
  );
};

const useStyles = makeStyles((c) => ({
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  field: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: c.surface,
  },
  icon: {
    width: 44,
    paddingLeft: 16,
    alignItems: "flex-start",
    justifyContent: "center",
    // The design sits icons slightly above centre (padding 3 top, 5 bottom)
    paddingBottom: 2,
  },
  input: {
    flex: 1,
    height: "100%",
    padding: 0,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: c.black,
  },
  error: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: c.danger,
  },
  hint: {
    marginTop: 10,
    fontFamily: fonts.segoe,
    fontSize: 11,
    lineHeight: 16.5,
    color: c.gray400,
  },
}));

export default TextField;
