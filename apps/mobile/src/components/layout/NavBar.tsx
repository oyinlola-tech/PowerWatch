import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "../icons/Icon";
import type { GlyphName } from "../icons/glyphs";
import { goToTab } from "../../services/navigation";
import type { NavItem } from "../../services/navigation";
import { alpha, colors, fonts } from "../../theme";

interface NavBarProps {
  active: NavItem;
}

const items: { id: NavItem; label: string; icon: GlyphName }[] = [
  { id: "dashboard", label: "Home", icon: "navHome" },
  { id: "map", label: "Map", icon: "navMap" },
  { id: "history", label: "Reports", icon: "navReports" },
  { id: "settings", label: "Profile", icon: "navProfile" },
];

// Figma component "nav bar": 80px tall, four equal items, active item in a blue tile
const NavBar = ({ active }: NavBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { height: 80 + insets.bottom, paddingBottom: insets.bottom + 1 }]}>
      {items.map(({ id, label, icon }) => {
        const isActive = active === id;
        // In the design the Home label is always bold; the others are regular
        const isHome = id === "dashboard";
        const labelFont = { fontFamily: isHome ? fonts.segoeBold : fonts.segoe };

        return (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => goToTab(id, active)}
            style={styles.item}
          >
            {isActive ? (
              <View style={styles.tile}>
                <Icon name={icon} color={colors.white} />
                <Text
                  style={[styles.label, labelFont, styles.activeLabel, { marginTop: isHome ? 2 : 4 }]}
                >
                  {label}
                </Text>
              </View>
            ) : (
              <>
                <View style={isHome && styles.inactiveHome}>
                  <Icon name={icon} color={colors.bg} />
                </View>
                <Text
                  style={[
                    styles.label,
                    labelFont,
                    isHome ? styles.inactiveHomeLabel : styles.inactiveLabel,
                  ]}
                >
                  {label}
                </Text>
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: alpha(colors.stroke, 0.6),
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: colors.white,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tile: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: 10,
    lineHeight: 15,
  },
  activeLabel: {
    color: colors.white,
  },
  inactiveLabel: {
    marginTop: 4,
    color: alpha(colors.bg, 0.7),
  },
  inactiveHome: {
    opacity: 0.7,
  },
  inactiveHomeLabel: {
    marginTop: 2,
    color: alpha(colors.bg, 0.7),
  },
});

export default NavBar;
