import { Pressable, StyleSheet, View } from "react-native";
import Icon from "../icons/Icon";
import Logo from "../ui/Logo";
import { goBack } from "../../services/navigation";
import { colors } from "../../theme";

interface BackHeaderProps {
  onBack?: () => void;
  /** Bottom padding: 16 everywhere; header height is 72 on report screens and 63 elsewhere */
  height: 72 | 63;
}

// Figma "Header": back arrow + logo, 1px bottom border
const BackHeader = ({ onBack, height }: BackHeaderProps) => (
  <View style={[styles.header, { height }]}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={onBack ?? goBack}
      hitSlop={8}
      style={styles.back}
    >
      <Icon name="backArrow" />
    </Pressable>
    <Logo />
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
  },
  back: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
  },
});

export default BackHeader;
