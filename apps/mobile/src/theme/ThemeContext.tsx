import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { StyleSheet, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SystemUI from "expo-system-ui";
import { darkColors, lightColors } from "./index";
import type { Palette } from "./index";

const THEME_KEY = "pw.theme";

interface ThemeValue {
  colors: Palette;
  isDark: boolean;
  /** Profile "Dark Mode" toggle; overrides the phone setting from then on */
  setDarkMode: (dark: boolean) => void;
  /** False until the saved choice has been read */
  ready: boolean;
}

const ThemeContext = createContext<ThemeValue>({
  colors: lightColors,
  isDark: false,
  setDarkMode: () => {},
  ready: true,
});

// Follows the phone's light/dark setting until the user picks one in Profile
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const system = useColorScheme();
  const [saved, setSaved] = useState<"light" | "dark" | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((value) => {
        if (value === "light" || value === "dark") setSaved(value);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const isDark = (saved ?? system) === "dark";
  const colors = isDark ? darkColors : lightColors;

  // Root view colour shows behind screens during transitions and the keyboard
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.screenBg).catch(() => {});
  }, [colors]);

  const setDarkMode = useCallback((dark: boolean) => {
    const value = dark ? "dark" : "light";
    setSaved(value);
    void AsyncStorage.setItem(THEME_KEY, value).catch(() => {});
  }, []);

  const value = useMemo(() => ({ colors, isDark, setDarkMode, ready }), [colors, isDark, setDarkMode, ready]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

/**
 * Theme-aware `StyleSheet.create`. Define styles from the palette once per module:
 *   const useStyles = makeStyles((c) => ({ root: { backgroundColor: c.screenBg } }));
 * then call `const styles = useStyles();` inside the component.
 */
export const makeStyles = <T extends StyleSheet.NamedStyles<T>>(factory: (c: Palette) => T) => {
  const cache = new Map<Palette, T>();
  return (): T => {
    const { colors } = useTheme();
    let styles = cache.get(colors);
    if (!styles) {
      styles = StyleSheet.create(factory(colors));
      cache.set(colors, styles);
    }
    return styles;
  };
};
