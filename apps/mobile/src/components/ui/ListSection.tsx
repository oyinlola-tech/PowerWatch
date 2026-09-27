import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "../icons/Icon";
import type { GlyphName } from "../icons/glyphs";
import { alpha, colors, fonts, type } from "../../theme";

// Section/row list from the Figma "Profile" screen (143:217), shared by the
// settings-style screens so they all match it.

interface RowProps {
  icon?: GlyphName;
  /** Width of the icon's slot in the design (icons differ in size) */
  iconWidth?: number;
  iconColor?: string;
  title: string;
  titleColor?: string;
  subtitle?: string;
  subtitleStyle?: "default" | "link";
  right?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export const Row = ({
  icon,
  iconWidth = 20,
  iconColor,
  title,
  titleColor = colors.ink,
  subtitle,
  subtitleStyle = "default",
  right,
  onPress,
  accessibilityLabel,
}: RowProps) => {
  const content = (
    <>
      <View style={styles.rowLeft}>
        {icon && (
          <View style={{ width: iconWidth, alignItems: "center" }}>
            <Icon name={icon} {...(iconColor ? { color: iconColor } : {})} />
          </View>
        )}
        <View style={styles.rowText}>
          <Text style={[type.boldText, { color: titleColor }]}>{title}</Text>
          {subtitle ? (
            <Text style={subtitleStyle === "link" ? styles.subtitleLink : styles.subtitle}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      {right}
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      {content}
    </Pressable>
  );
};

export const Divider = () => <View style={styles.divider} />;

interface SectionProps {
  title: string;
  titleColor?: string;
  children: ReactNode;
}

export const Section = ({ title, titleColor = colors.navy, children }: SectionProps) => (
  <View style={styles.section}>
    <Text accessibilityRole="header" style={[type.boldText, { color: titleColor }]}>
      {title}
    </Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

export const Chevron = () => <Icon name="chevronRight" />;

/** Shared text styles for settings-style screens */
export const listStyles = StyleSheet.create({
  subtitle: {
    fontFamily: fonts.hankenMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    color: colors.slate,
  },
});

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: alpha(colors.stroke, 0.6),
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 16,
  },
  rowLeft: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  rowText: {
    flexShrink: 1,
  },
  subtitle: {
    fontFamily: fonts.hankenMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    color: colors.slate,
  },
  subtitleLink: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 15,
    color: colors.navy,
  },
  divider: {
    height: 1,
    marginHorizontal: 8.5,
    backgroundColor: colors.stroke,
  },
});
