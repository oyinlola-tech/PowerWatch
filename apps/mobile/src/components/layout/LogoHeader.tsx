import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Logo from "../ui/Logo";
import { colors } from "../../theme";

interface LogoHeaderProps {
  /** Element on the right edge, e.g. the location pin on Home */
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Figma "Background+HorizontalBorder": white strip, logo, 1px bottom border
const LogoHeader = ({ right, style }: LogoHeaderProps) => (
  <View style={[styles.header, style]}>
    <Logo />
    {right}
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
    paddingTop: 1,
  },
});

export default LogoHeader;
