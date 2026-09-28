import { Text, View } from "react-native";
import type { RecentStreetReport } from "../../services/api";
import { fonts } from "../../theme";
import { makeStyles, useTheme } from "../../theme/ThemeContext";

const MAX_ROWS = 5;

/**
 * Compact "street · status · N reports" list for the streets reported from recently.
 * Renders nothing when there is nothing to show. No Figma frame — follows the small
 * muted list rows used elsewhere (e.g. Saved Neighborhoods, Map screen lists).
 */
const RecentStreets = ({ streets }: { streets: RecentStreetReport[] }) => {
  const { colors } = useTheme();
  const styles = useStyles();

  if (!streets.length) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Recent street reports</Text>
      <View style={styles.list}>
        {streets.slice(0, MAX_ROWS).map((s) => (
          <Text key={`${s.street}-${s.reportType}`} style={styles.row} numberOfLines={1}>
            {s.street}
            <Text style={{ color: s.reportType === "ON" ? colors.powerOn : colors.powerOff }}>
              {" · "}
              {s.reportType}
            </Text>
            <Text style={styles.muted}>
              {" · "}
              {s.reports} {s.reports === 1 ? "report" : "reports"}
            </Text>
          </Text>
        ))}
      </View>
    </View>
  );
};

const useStyles = makeStyles((c) => ({
  wrap: {
    alignSelf: "stretch",
    marginTop: 16,
    gap: 8,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: c.muted,
  },
  list: {
    gap: 4,
  },
  row: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: c.ink,
  },
  muted: {
    color: c.muted,
  },
}));

export default RecentStreets;
