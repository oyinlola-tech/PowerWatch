import { Pressable, Text, View } from "react-native";
import Icon from "../icons/Icon";
import { comingSoon } from "../../services/navigation";
import { fonts, type } from "../../theme";
import { makeStyles, useTheme } from "../../theme/ThemeContext";

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
}: SocialButtonsProps) => {
  const { colors } = useTheme();
  const styles = useStyles();

  return (
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
          accessibilityLabel="Continue with Google"
          onPress={() => comingSoon("Sign in with Google")}
          style={({ pressed }) => [styles.button, styles.google, pressed && styles.pressed]}
        >
          <Icon name="google" />
          <Text style={[type.boldText, styles.label]}>Google</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue with Apple"
          onPress={() => comingSoon("Sign in with Apple")}
          style={({ pressed }) => [styles.button, styles.apple, pressed && styles.pressed]}
        >
          <Icon name="apple" color={colors.black} />
          <Text style={[type.boldText, styles.label]}>Apple</Text>
        </Pressable>
      </View>
    </View>
  );
};

const useStyles = makeStyles((c) => ({
  divider: {
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: c.border,
  },
  dividerLabel: {
    // Sits on the screen, masking the divider line (Figma white on #FBFEFF)
    backgroundColor: c.screenBg,
    paddingHorizontal: 16,
    fontSize: 14,
    lineHeight: 20,
    color: c.gray400,
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
    borderColor: c.border,
    borderRadius: 12,
    backgroundColor: c.card,
  },
  google: {
    paddingLeft: 16,
  },
  apple: {
    justifyContent: "center",
  },
  pressed: {
    backgroundColor: c.surface,
  },
  label: {
    color: c.black,
  },
}));

export default SocialButtons;
