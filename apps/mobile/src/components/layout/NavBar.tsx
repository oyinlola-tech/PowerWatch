import { Pressable, Text, View } from "react-native";
import { usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "../icons/Icon";
import type { GlyphName } from "../icons/glyphs";
import { goToTab } from "../../services/navigation";
import type { NavItem } from "../../services/navigation";
import { alpha, fonts, layout, MAX_CONTENT_WIDTH } from "../../theme";
import { makeStyles, useTheme } from "../../theme/ThemeContext";

interface NavBarProps {
  active: NavItem;
}

const items: { id: NavItem; label: string; icon: GlyphName }[] = [
  { id: "dashboard", label: "Home", icon: "navHome" },
  { id: "map", label: "Map", icon: "navMap" },
  { id: "history", label: "Reports", icon: "navReports" },
  { id: "settings", label: "Profile", icon: "navProfile" },
];

// Figma component "nav bar": 80px tall, four equal items, active item in a blue tile.
// Rendered by Screen, below the scrolling content.
const NavBar = ({ active }: NavBarProps) => {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { colors } = useTheme();
  const styles = useStyles();
  // False on screens opened from a tab (e.g. Profile Settings under Profile)
  const onTabRoot = pathname === `/${active}`;

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]} accessibilityRole="tablist">
      <View style={styles.items}>
        {items.map(({ id, label, icon }) => {
          const isActive = active === id;
          // In the design the Home label is always bold; the others are regular
          const labelFont = { fontFamily: id === "dashboard" ? fonts.segoeBold : fonts.segoe };

          return (
            <Pressable
              key={id}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: isActive }}
              onPress={() => goToTab(id, active, onTabRoot)}
              style={styles.item}
            >
              <View style={[styles.tile, isActive && styles.tileActive]}>
                <View style={styles.icon}>
                  <Icon name={icon} color={isActive ? colors.white : alpha(colors.bg, 0.7)} />
                </View>
                <Text style={[styles.label, labelFont, isActive && styles.labelActive]} numberOfLines={1}>
                  {label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const useStyles = makeStyles((c) => ({
  bar: {
    borderTopWidth: 1,
    borderTopColor: alpha(c.stroke, 0.6),
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: c.card,
  },
  items: {
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    height: layout.navHeight - 1,
    alignSelf: "center",
    flexDirection: "row",
  },
  // Fills the bar so the whole column can be tapped, not just the icon
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
    gap: 2,
    borderRadius: 8,
  },
  tileActive: {
    backgroundColor: c.primary,
  },
  // Icons differ in size; a fixed slot keeps the four labels on one line
  icon: {
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    lineHeight: 15,
    color: alpha(c.bg, 0.7),
  },
  labelActive: {
    color: c.white,
  },
}));

export default NavBar;
