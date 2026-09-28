import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "../icons/Icon";
import Logo from "../ui/Logo";
import { goBack } from "../../services/navigation";
import { layout, MAX_CONTENT_WIDTH } from "../../theme";
import { makeStyles, useTheme } from "../../theme/ThemeContext";

interface AppHeaderProps {
  /** Shows the back arrow before the logo */
  back?: boolean;
  onBack?: () => void;
  /** Elements on the right edge, e.g. the bell and location pin on Home */
  right?: ReactNode;
}

// Figma "Header": back arrow + logo, 1px bottom border. One size on every screen;
// Screen keeps it fixed above the scrolling content and it fills the status bar area.
const AppHeader = ({ back = false, onBack, right }: AppHeaderProps) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <View style={styles.left}>
          {back && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={onBack ?? goBack}
              hitSlop={10}
              style={({ pressed }) => [styles.back, pressed && styles.pressed]}
            >
              <Icon name="backArrow" color={colors.bg} />
            </Pressable>
          )}
          <Logo />
        </View>
        {right}
      </View>
    </View>
  );
};

const useStyles = makeStyles((c) => ({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    backgroundColor: c.card,
  },
  row: {
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    height: layout.headerHeight - 1,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.gutter,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  back: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
  },
  pressed: {
    opacity: 0.6,
  },
}));

export default AppHeader;
