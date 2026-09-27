import { Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "../icons/Icon";
import { colors, fonts, type } from "../../theme";

interface SocialButtonsProps {
  dividerLabel: string;
  /** Inter on login; the sign-up screen sets this label in Segoe UI */
  dividerFont?: string;
  /** Vertical padding around the divider: 40 on login, 32 on sign up */
  dividerPadding: number;
}

const SocialButtons = ({
  dividerLabel,
  dividerFont = fonts.regular,
  dividerPadding,
}: SocialButtonsProps) => (
  <View>
    {/* Divider */}
    <View style={[styles.divider, { paddingVertical: dividerPadding }]}>
      <View style={styles.line} />
      <Text style={[styles.dividerLabel, { fontFamily: dividerFont }]}>{dividerLabel}</Text>
    </View>

    {/* Social buttons */}
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, styles.google, pressed && styles.pressed]}
      >
        <Icon name="google" />
        <Text style={[type.boldText, styles.label]}>Google</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, styles.apple, pressed && styles.pressed]}
      >
        <Icon name="apple" />
        <Text style={[type.boldText, styles.label]}>Apple</Text>
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  divider: {
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerLabel: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray400,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  button: {
    flex: 1,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  google: {
    paddingLeft: 16,
  },
  apple: {
    justifyContent: "center",
  },
  pressed: {
    backgroundColor: colors.surface,
  },
  label: {
    color: colors.black,
  },
});

export default SocialButtons;
