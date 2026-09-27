import type { ReactNode } from "react";
import { View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Logo from "../ui/Logo";
import { makeStyles } from "../../theme/ThemeContext";

interface LogoHeaderProps {
  /** Element on the right edge, e.g. the location pin on Home */
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Figma "Background+HorizontalBorder": white strip, logo, 1px bottom border
const LogoHeader = ({ right, style }: LogoHeaderProps) => {
  const styles = useStyles();
  return (
    <View style={[styles.header, style]}>
      <Logo />
      {right}
    </View>
  );
};

const useStyles = makeStyles((c) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
    backgroundColor: c.card,
    paddingTop: 1,
  },
}));

export default LogoHeader;
