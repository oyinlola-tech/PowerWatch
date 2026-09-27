import type { ReactNode } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type { StyleProp, TextInputProps, ViewStyle } from "react-native";
import Icon from "../icons/Icon";
import type { GlyphName } from "../icons/glyphs";
import { colors, fonts, type } from "../../theme";

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
  containerStyle?: StyleProp<ViewStyle>;
}

const TextField = ({
  label,
  icon,
  borderColor = colors.border,
  labelGap = 8,
  labelRight,
  right,
  hint,
  containerStyle,
  ...input
}: TextFieldProps) => (
  <View style={containerStyle}>
    <View style={[styles.labelRow, { marginBottom: labelGap }]}>
      <Text style={[type.boldText, { color: colors.gray700 }]}>{label}</Text>
      {labelRight}
    </View>

    <View style={[styles.field, { borderColor }]}>
      <View style={styles.icon}>
        <Icon name={icon} />
      </View>

      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.gray400}
        autoCapitalize="none"
        autoCorrect={false}
        {...input}
        style={styles.input}
      />

      {right}
    </View>

    {hint && <Text style={styles.hint}>{hint}</Text>}
  </View>
);

const styles = StyleSheet.create({
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
    backgroundColor: colors.surface,
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
    color: colors.black,
  },
  hint: {
    marginTop: 10,
    fontFamily: fonts.segoe,
    fontSize: 11,
    lineHeight: 16.5,
    color: colors.gray400,
  },
});

export default TextField;
