import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackHeader from "../components/layout/BackHeader";
import NavBar from "../components/layout/NavBar";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import { startReport } from "../services/navigation";
import { colors, shadows, type } from "../theme";

interface DayRecord {
  id: string;
  label: string;
  offLabel: string;
  /** Outage as a share of the day: where it starts and how long it lasts (0-1) */
  outage?: { start: number; length: number };
  opacity?: number;
}

const BAR_WIDTH = 285;

// Replace with data fetched from your backend
const history: DayRecord[] = [
  {
    id: "1",
    label: "Today, June 14",
    offLabel: "0h 45m Off",
    outage: { start: 213.75 / BAR_WIDTH, length: 11.88 / BAR_WIDTH },
  },
  { id: "2", label: "Yesterday, June 13", offLabel: "0h 00m Off" },
  {
    id: "3",
    label: "Tuesday, June 12",
    offLabel: "5h 20m Off",
    outage: { start: 47.5 / BAR_WIDTH, length: 59.38 / BAR_WIDTH },
  },
  {
    id: "4",
    label: "Monday, June 11",
    offLabel: "1h 10m Off",
    outage: { start: 237.5 / BAR_WIDTH, length: 23.75 / BAR_WIDTH },
    opacity: 0.8,
  },
  { id: "5", label: "Sunday, June 10", offLabel: "0h 00m Off", opacity: 0.7 },
];

const FloatingReportButton = () => {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Report power status"
      onPress={startReport}
      style={[styles.fab, { bottom: 80 + 21 + insets.bottom }]}
    >
      <Icon name="plusCircle" />
    </Pressable>
  );
};

// Figma "History" (60:1419)
const WeeklyHistory = () => (
  <Screen
    top={23}
    bottom={80 + 42}
    overlay={
      <>
        <FloatingReportButton />
        <NavBar active="history" />
      </>
    }
  >
    <BackHeader height={63} />

    <View style={styles.content}>
      {/* Weekly summary */}
      <View style={styles.titleRow}>
        <Text accessibilityRole="header" style={[type.h1, { color: colors.ink }]}>
          Weekly History
        </Text>
        <Text style={[type.boldText, { color: colors.muted }]}>Last 7 Days</Text>
      </View>

      <View style={styles.bento}>
        <View style={styles.bentoRow}>
          <View style={[styles.card, { height: 73 }]}>
            <Text style={[type.lightText, { color: colors.slate }]}>Total Outage Time</Text>
            <Text style={[type.buttonText, styles.value, { color: colors.danger }]}>12h 45m</Text>
          </View>
          <View style={[styles.card, { height: 75 }]}>
            <Text style={[type.lightText, { color: colors.slate }]}>Uptime Percentage</Text>
            <Text style={[type.buttonText, styles.value, { color: colors.primary }]}>92.4%</Text>
          </View>
        </View>

        <View style={styles.longest}>
          <View>
            <Text style={[type.boldText, { color: colors.slateMuted }]}>Longest Single Outage</Text>
            <View style={styles.longestValue}>
              <Text style={[type.buttonText, styles.duration]}>5h 20m</Text>
              <Text style={[type.boldText, styles.day]}>(Tuesday)</Text>
            </View>
          </View>
          <View style={styles.timer}>
            <Icon name="timer" />
          </View>
        </View>
      </View>

      {/* Daily timelines */}
      <View style={styles.timelineHeader}>
        <Text accessibilityRole="header" style={[type.buttonText, { color: colors.slate }]}>
          Daily Timeline
        </Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.timelineOn }]} />
            <Text style={[type.boldText, { color: colors.muted }]}>ON</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
            <Text style={[type.boldText, { color: colors.muted }]}>OFF</Text>
          </View>
        </View>
      </View>

      <View style={styles.days}>
        {history.map((day) => (
          <View key={day.id} style={[styles.day_, { opacity: day.opacity ?? 1 }]}>
            <View style={styles.dayHeader}>
              <Text style={[type.boldText, { color: colors.ink }]}>{day.label}</Text>
              <Text style={[type.boldText, { color: day.outage ? colors.danger : colors.navy }]}>
                {day.offLabel}
              </Text>
            </View>

            <View style={styles.dayBody}>
              <View style={styles.bar}>
                {day.outage && (
                  <View
                    style={[
                      styles.outage,
                      {
                        left: `${day.outage.start * 100}%`,
                        width: `${day.outage.length * 100}%`,
                      },
                    ]}
                  />
                )}
              </View>
              <View style={styles.scale}>
                <Text style={[type.boldText, { color: colors.muted }]}>00:00</Text>
                <Text style={[type.boldText, { color: colors.muted }]}>12:00</Text>
                <Text style={[type.boldText, { color: colors.muted }]}>23:59</Text>
              </View>
            </View>
          </View>
        ))}

        <Pressable accessibilityRole="button" style={styles.loadMore}>
          <Text style={[type.boldText, styles.loadMoreLabel]}>Load 30 Day History</Text>
        </Pressable>
      </View>
    </View>
  </Screen>
);

const styles = StyleSheet.create({
  content: {
    width: 319,
    maxWidth: "100%",
    alignSelf: "center",
    paddingTop: 42,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bento: {
    marginTop: 20,
    gap: 8,
  },
  bentoRow: {
    height: 86,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 15,
  },
  value: {
    marginTop: 1,
  },
  longest: {
    height: 82,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: "#E2EEFF",
    paddingTop: 16,
    paddingLeft: 15,
    paddingRight: 12,
  },
  longestValue: {
    marginTop: 9,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  duration: {
    color: colors.slateMuted,
  },
  day: {
    color: colors.slateMuted,
    opacity: 0.7,
  },
  timer: {
    marginTop: 11,
    opacity: 0.4,
  },
  timelineHeader: {
    marginTop: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 12,
  },
  days: {
    marginTop: 16,
    gap: 16,
  },
  day_: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.gray,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dayBody: {
    gap: 8,
    padding: 16,
  },
  bar: {
    height: 24,
    overflow: "hidden",
    borderRadius: 2,
    backgroundColor: colors.timelineOn,
  },
  outage: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: colors.danger,
  },
  scale: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  loadMore: {
    height: 51,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 8,
  },
  loadMoreLabel: {
    textAlign: "center",
    color: colors.primary,
  },
  fab: {
    position: "absolute",
    right: 28,
    width: 49,
    height: 49,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.primary,
    boxShadow: shadows.raised(colors.black),
  },
});

export default WeeklyHistory;
