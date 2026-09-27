import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MAX_CONTENT_WIDTH } from "../../theme";
import { makeStyles, useTheme } from "../../theme/ThemeContext";

interface ScreenProps {
  children: ReactNode;
  /** Top padding of the Figma frame; grows when the device status bar is taller */
  top: number;
  bottom?: number;
  contentStyle?: StyleProp<ViewStyle>;
  /** Fixed elements drawn over the scroll area (nav bar, floating button) */
  overlay?: ReactNode;
  /** Enables pull-to-refresh */
  onRefresh?: () => void;
  refreshing?: boolean;
}

const Screen = ({ children, top, bottom = 0, contentStyle, overlay, onRefresh, refreshing = false }: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.root}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: Math.max(top, insets.top + 8),
          paddingBottom: bottom + insets.bottom,
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
  },
}));

export default Screen;
