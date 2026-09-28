// Design tokens taken from the PowerWatch Figma file (HI-FI section).
// See docs/figma-spec.md for the per-screen values.

export const lightColors = {
  // Figma colour styles
  primary: "#0663EA",
  bg: "#1B3A4B", // dark text colour, named "Bg" in Figma
  text: "#FCFEFF",
  screenBg: "#FBFEFF",
  gray: "#F2F5F4",
  /** Foreground on coloured fills (buttons, badges); white in both themes */
  white: "#FFFFFF",
  /** Card and sheet surfaces: white in light mode */
  card: "#FFFFFF",
  /** Brand blue for text, links and icons on screen/card backgrounds */
  accent: "#0663EA",
  powerOn: "#07B447",
  powerOff: "#E20911",

  black: "#000000",
  ink: "#1B1C1C",
  navy: "#003178",
  slate: "#434652",
  slateMuted: "#56656E",
  slateIcon: "#526069",
  muted: "#737783",
  buttonMuted: "#5C727E",

  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  checkboxBorder: "#767676",

  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  borderSoft: "#EAE7E7",
  borderInput: "#D1D5DB",
  borderButton: "#E3E8EE",
  stroke: "#C3C6D4",

  surface: "#F9FAFB",
  surfaceNote: "#F8F9FA",
  tintBlue: "#C8E0FF",
  tintBlueLight: "#E2EEFF",
  avatarBg: "#D9E2FF",
  mapBg: "#E5E2E1",

  timelineOn: "#4CAF50",
  danger: "#BA1A1A",
  dangerTint: "#FFDAD6",
};

export type Palette = { [K in keyof typeof lightColors]: string };

// Figma has no dark designs. This palette keeps the brand blue and status colours
// and swaps the neutrals for navy surfaces (same values as the landing page).
export const darkColors: Palette = {
  primary: "#0663EA",
  bg: "#E8F0F8",
  text: "#FCFEFF",
  screenBg: "#07111F",
  gray: "#15243A",
  white: "#FFFFFF",
  card: "#0E1B2E",
  accent: "#6BA5FF",
  powerOn: "#07B447",
  powerOff: "#E20911",

  black: "#F3F6FA",
  ink: "#E8F0F8",
  navy: "#9CC2FF",
  slate: "#C3CAD6",
  slateMuted: "#9AA8B6",
  slateIcon: "#9AA8B6",
  muted: "#8C97A8",
  buttonMuted: "#A6B4C6",

  gray400: "#6B7A8F",
  gray500: "#8C97A8",
  gray600: "#A6B4C6",
  gray700: "#C3CAD6",
  checkboxBorder: "#8C97A8",

  border: "#24344C",
  borderLight: "#1A2A41",
  borderSoft: "#22324A",
  borderInput: "#2E405C",
  borderButton: "#2A3A52",
  stroke: "#3A4B66",

  surface: "#111F33",
  surfaceNote: "#111F33",
  tintBlue: "#12305E",
  tintBlueLight: "#102746",
  avatarBg: "#1B3563",
  mapBg: "#1A2433",

  timelineOn: "#4CAF50",
  danger: "#FF6B6B",
  dangerTint: "#3A1518",
};


/** `color` at the given opacity, e.g. alpha(colors.stroke, 0.3) */
export const alpha = (hex: string, opacity: number) => {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  // Stands in for the design's "Segoe UI" layers (see assets/fonts/README.md)
  segoe: "Selawik_400Regular",
  segoeSemibold: "Selawik_600SemiBold",
  segoeBold: "Selawik_700Bold",
  hankenMedium: "HankenGrotesk_500Medium",
  hankenSemibold: "HankenGrotesk_600SemiBold",
} as const;

// Figma text styles. Line heights are Figma's "Auto" values for Inter.
export const type = {
  h1: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 29 },
  buttonText: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 19 },
  boldText: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 17 },
  headers: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 17 },
  lightText: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 23, letterSpacing: 0.14 },
} as const;

export const shadows = {
  /** Drop shadow 0 1 2 0 #000 5% */
  card: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  /** Drop shadow 0 8 30 0 #000 4% */
  sheet: "0 8px 30px 0 rgba(0, 0, 0, 0.04)",
  /** 0 4 6 -4 + 0 10 15 -3, in the given colour at 10% */
  raised: (hex: string) =>
    `0 4px 6px -4px ${alpha(hex, 0.1)}, 0 10px 15px -3px ${alpha(hex, 0.1)}`,
};

/** Width of the design frames; content is centred and capped on larger devices */
export const DESIGN_WIDTH = 375;
export const MAX_CONTENT_WIDTH = 512;

// Measurements every screen shares, so headers, cards and the nav bar line up
export const layout = {
  /** Space between the screen edge and its content */
  gutter: 16,
  /** Header row under the status bar: 16 + logo 31 + 16, plus the 1px border */
  headerHeight: 64,
  /** Figma component "nav bar" */
  navHeight: 80,
  /** Space between the header and the first element */
  contentTop: 24,
} as const;
