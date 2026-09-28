import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NavBar from "./NavBar";
import { useAuth } from "../../context/AuthContext";
import type { NavItem } from "../../services/navigation";
import { layout, MAX_CONTENT_WIDTH } from "../../theme";
import { makeStyles, useTheme } from "../../theme/ThemeContext";

interface ScreenProps {
  children: ReactNode;
  /** Stays fixed above the scrolling content (see AppHeader) */
  header?: ReactNode;
  /** Shows the nav bar with this tab highlighted. Only signed-in users see it. */
  nav?: NavItem;
  /** Space above the content. Without a header it also clears the status bar. */
  top?: number;
  bottom?: number;
  contentStyle?: StyleProp<ViewStyle>;
  /** Floating elements drawn over the scroll area, above the nav bar */
  overlay?: ReactNode;
  /** Enables pull-to-refresh */
  onRefresh?: () => void;
  refreshing?: boolean;
}

const useKeyboardVisible = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
};

const Screen = ({
  children,
  header,
  nav,
  top = layout.contentTop,
  bottom = layout.contentTop,
  contentStyle,
  overlay,
  onRefresh,
  refreshing = false,
}: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { status } = useAuth();
  const styles = useStyles();
  const keyboardVisible = useKeyboardVisible();

  // The nav bar would sit on top of the keyboard and cover the field being typed in
  const showNav = Boolean(nav) && status === "signedIn" && !keyboardVisible;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {header}

      <View style={styles.root}>
        <ScrollView
          style={styles.root}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: header ? top : Math.max(top, insets.top + 8),
            // The nav bar covers the bottom inset when it is shown
            paddingBottom: bottom + (showNav ? 0 : insets.bottom),
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
            ) : undefined
          }
        >
          <View style={[styles.content, contentStyle]}>{children}</View>
        </ScrollView>

        {overlay}
      </View>

      {showNav && nav && <NavBar active={nav} />}
    </KeyboardAvoidingView>
  );
};

const useStyles = makeStyles((c) => ({
  root: {
    flex: 1,
    backgroundColor: c.screenBg,
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: "center",
    paddingHorizontal: layout.gutter,
  },
}));

export default Screen;
