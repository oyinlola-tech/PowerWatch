import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackHeader from "../components/layout/BackHeader";
import NavBar from "../components/layout/NavBar";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import { EmptyView, ErrorView, LoadingView } from "../components/ui/StateViews";
import { useUser } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { historyApi } from "../services/api";
import type { HistorySummary } from "../services/api";
import { startReport } from "../services/navigation";
import { dayFraction, dayLabel, formatDuration, weekdayName } from "../utils/format";
import { colors, shadows, type } from "../theme";

// Older days fade out, as in the design (cards 4 and 5)
const dayOpacity = (index: number) => (index === 3 ? 0.8 : index >= 4 ? 0.7 : 1);

const DayCard = ({ day, index }: { day: HistorySummary["days"][number]; index: number }) => {
  const hadOutage = day.offMinutes > 0;
  return (
    <View style={[styles.day_, { opacity: dayOpacity(index) }]}>
      <View style={styles.dayHeader}>
        <Text style={[type.boldText, { color: colors.ink }]}>{dayLabel(day.date, index)}</Text>
        <Text style={[type.boldText, { color: hadOutage ? colors.danger : colors.navy }]}>
          {formatDuration(day.offMinutes)} Off
        </Text>
      </View>

      <View style={styles.dayBody}>
        <View
          style={styles.bar}
          accessibilityLabel={
            hadOutage
              ? `Power off ${day.outages.map((o) => `${o.startTime} to ${o.endTime}`).join(", ")}`
              : "Power on all day"
          }
        >
          {day.outages.map((outage) => {
            const start = dayFraction(outage.startTime);
            const end = outage.endTime === "23:59" ? 1 : dayFraction(outage.endTime);
            return (
              <View
                key={outage.start}
                style={[
                  styles.outage,
                  // Keep very short outages visible
                  { left: `${start * 100}%`, width: `${Math.max(end - start, 0.006) * 100}%` },
                ]}
              />
            );
          })}
        </View>
        <View style={styles.scale}>
          <Text style={[type.boldText, { color: colors.muted }]}>00:00</Text>
          <Text style={[type.boldText, { color: colors.muted }]}>12:00</Text>
          <Text style={[type.boldText, { color: colors.muted }]}>23:59</Text>
        </View>
      </View>
    </View>
  );
};

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

// Figma "History" (60:1419); "History, empty variant" (270:229) when there's no data
const WeeklyHistory = () => {
  const user = useUser();
  const [days, setDays] = useState<7 | 30>(7);
  const summary = useApi(() => historyApi.summary(days), `${days}-${user.neighborhoodId ?? 0}`);
  const data = summary.data;

  return (
    <Screen
      top={23}
      bottom={80 + 42}
      onRefresh={summary.refresh}
      refreshing={summary.refreshing}
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
            {days === 7 ? "Weekly History" : "Monthly History"}
          </Text>
          <Text style={[type.boldText, { color: colors.muted }]}>Last {days} Days</Text>
        </View>

        {!user.neighborhoodId ? (
          <EmptyView
            icon="mapOutline"
            title="No neighborhood selected"
            message="Set your monitoring area to see its outage history."
          />
        ) : summary.loading ? (
          <LoadingView label="Loading history…" />
        ) : summary.error && !data ? (
          <ErrorView message={summary.error.message} onRetry={summary.refresh} />
        ) : data && !data.hasData ? (
          <EmptyView
            icon="timer"
            title="No history yet"
            message={`Nobody has reported power in ${data.neighborhood.name} in the last ${days} days. Your reports build this timeline.`}
          />
        ) : data ? (
          <>
            <View style={styles.bento}>
              <View style={styles.bentoRow}>
                <View style={[styles.card, { height: 73 }]}>
                  <Text style={[type.lightText, { color: colors.slate }]}>Total Outage Time</Text>
                  <Text style={[type.buttonText, styles.value, { color: colors.danger }]}>
                    {formatDuration(data.totalOutageMinutes)}
                  </Text>
                </View>
                <View style={[styles.card, { height: 75 }]}>
                  <Text style={[type.lightText, { color: colors.slate }]}>Uptime Percentage</Text>
                  <Text style={[type.buttonText, styles.value, { color: colors.primary }]}>
                    {data.uptimePercent}%
                  </Text>
                </View>
              </View>

              <View style={styles.longest}>
                <View>
                  <Text style={[type.boldText, { color: colors.slateMuted }]}>Longest Single Outage</Text>
                  <View style={styles.longestValue}>
                    <Text style={[type.buttonText, styles.duration]}>
                      {data.longestOutage ? formatDuration(data.longestOutage.minutes) : "None"}
                    </Text>
                    {data.longestOutage && (
                      <Text style={[type.boldText, styles.day]}>
                        ({data.longestOutage.ongoing ? "ongoing" : weekdayName(data.longestOutage.date)})
                      </Text>
                    )}
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
              {data.days.map((day, index) => (
                <DayCard key={day.date} day={day} index={index} />
              ))}

              <Pressable
                accessibilityRole="button"
                onPress={() => setDays(days === 7 ? 30 : 7)}
                style={styles.loadMore}
              >
                <Text style={[type.boldText, styles.loadMoreLabel]}>
                  {days === 7 ? "Load 30 Day History" : "Show Last 7 Days"}
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </View>
    </Screen>
  );
};

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
