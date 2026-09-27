import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, MAX_CONTENT_WIDTH } from "../../theme";

interface ScreenProps {
  children: ReactNode;
  /** Top padding of the Figma frame; grows when the device status bar is taller */
  top: number;
  bottom?: number;
  contentStyle?: StyleProp<ViewStyle>;
  /** Fixed elements drawn over the scroll area (nav bar, floating button) */
  overlay?: ReactNode;
}

const Screen = ({ children, top, bottom = 0, contentStyle, overlay }: ScreenProps) => {
  const insets = useSafeAreaInsets();

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
      >
        <View style={[styles.content, contentStyle]}>{children}</View>
      </ScrollView>

      {overlay}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: "center",
  },
});

export default Screen;
