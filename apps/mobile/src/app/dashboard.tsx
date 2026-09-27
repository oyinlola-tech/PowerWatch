import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import LogoHeader from "../components/layout/LogoHeader";
import NavBar from "../components/layout/NavBar";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import { ErrorView, LoadingView } from "../components/ui/StateViews";
import { useUser } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { reportsApi } from "../services/api";
import type { ApiPowerStatus } from "../services/api";
import { changeNeighborhood, reportPower } from "../services/navigation";
import { timeAgo } from "../utils/format";
import { alpha, colors, fonts, shadows, type } from "../theme";

const heroCopy: Record<ApiPowerStatus, { badge: string; title: string; color: string }> = {
  ON: { badge: "On", title: "Power is Live", color: colors.powerOn },
  OFF: { badge: "Off", title: "Power is Out", color: colors.powerOff },
  UNKNOWN: { badge: "Unknown", title: "No reports yet", color: colors.gray400 },
};

const confirmedLabel = (count: number, status: ApiPowerStatus) => {
  if (status === "UNKNOWN") return "Be the first to report in your area";
  if (count === 0) return "No recent confirmations";
  return `Confirmed by ${count} ${count === 1 ? "neighbor" : "neighbors"}`;
};

// Figma "Home Screen (Status Hub)" (33:910)
const Dashboard = () => {
  const user = useUser();
  const neighborhoodKey = user.neighborhoodId ?? 0;
  const status = useApi(() => reportsApi.status(), neighborhoodKey);
  const activity = useApi(() => reportsApi.activity(5), neighborhoodKey);

  const live = status.data;
  const hero = heroCopy[live?.status ?? "UNKNOWN"];
  const neighborhoodName = live?.neighborhood.name ?? user.neighborhood?.name ?? "Your neighborhood";

  const refresh = () => {
    void status.refresh();
    void activity.refresh();
  };

  const report = (next: "on" | "off") => {
    if (!user.neighborhoodId) {
      Alert.alert("Choose your neighborhood", "Set your monitoring area before reporting.", [
        { text: "Not now", style: "cancel" },
        { text: "Choose", onPress: changeNeighborhood },
      ]);
      return;
    }
    reportPower(next);
  };

  return (
    <Screen
      top={41}
      bottom={112}
      contentStyle={styles.main}
      overlay={<NavBar active="dashboard" />}
      onRefresh={refresh}
      refreshing={status.refreshing || activity.refreshing}
    >
      <LogoHeader
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open map"
            hitSlop={8}
            onPress={() => router.navigate("/map")}
          >
            <Icon name="locationPin" />
          </Pressable>
        }
      />

      {/* Neighborhood status card */}
      <View style={styles.statusSection}>
        <View style={styles.rowBetween}>
          <Text style={[type.lightText, styles.caption]}>Current Neighborhood</Text>
          <Pressable
            accessibilityRole="button"
            onPress={changeNeighborhood}
            hitSlop={8}
            style={styles.change}
          >
            <Text style={[type.lightText, { color: colors.primary }]}>Change</Text>
            <Icon name="pencil" />
          </Pressable>
        </View>

        <Text accessibilityRole="header" style={styles.neighborhood}>
          {neighborhoodName}
        </Text>

        <View style={styles.hero}>
          {status.loading ? (
            <LoadingView label="Checking the latest reports…" />
          ) : status.error && !live ? (
            <ErrorView message={status.error.message} onRetry={refresh} />
          ) : (
            <>
              <View style={styles.badge}>
                <View style={styles.badgeDot} />
                <Text style={styles.badgeLabel}>Electricity Status: {hero.badge}</Text>
              </View>

              <View style={styles.bulb}>
                <Icon name="bulb" color={hero.color} />
              </View>

              <Text style={styles.heroTitle}>{hero.title}</Text>
              <Text style={[type.lightText, styles.heroSubtitle]}>
                {confirmedLabel(live?.confirmedBy ?? 0, live?.status ?? "UNKNOWN")}
              </Text>

              <View style={styles.stats}>
                <View style={styles.stat}>
                  <Text style={[type.lightText, styles.statLabel]}>CONFIDENCE</Text>
                  <Text style={[type.buttonText, styles.statValue]}>
                    {live && live.recentReporters > 0 ? `${live.confidence}%` : "—"}
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[type.lightText, styles.statLabel]}>LAST UPDATE</Text>
                  <Text style={[type.buttonText, styles.statValue]}>{timeAgo(live?.lastReportAt)}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Reporting actions */}
      <View style={styles.section}>
        <Text style={[type.lightText, { color: colors.muted }]}>
          Something changed? Report it now
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => report("on")}
          style={({ pressed }) => [
            styles.report,
            { backgroundColor: colors.powerOn },
            pressed && styles.pressed,
          ]}
        >
          <Icon name="bolt" />
          <Text style={[type.buttonText, { color: colors.white }]}>Report Power ON</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => report("off")}
          style={({ pressed }) => [
            styles.report,
            { backgroundColor: colors.powerOff },
            pressed && styles.pressed,
          ]}
        >
          <Icon name="plugOff" />
          <Text style={[type.buttonText, { color: colors.white }]}>Report Power OFF</Text>
        </Pressable>
      </View>

      {/* Recent activity */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text accessibilityRole="header" style={[type.buttonText, styles.activityTitle]}>
            Neighborhood Activity
          </Text>
          <Pressable accessibilityRole="button" onPress={() => router.push("/history")} hitSlop={8}>
            <Text style={[type.headers, styles.seeHistory]}>See History</Text>
          </Pressable>
        </View>

        <View style={styles.list}>
          {activity.loading ? (
            <View style={styles.listRow}>
              <LoadingView style={styles.listState} />
            </View>
          ) : activity.error && !activity.data ? (
            <View style={styles.listRow}>
              <ErrorView message={activity.error.message} onRetry={refresh} style={styles.listState} />
            </View>
          ) : !activity.data?.length ? (
            <View style={styles.listRow}>
              <Text style={[type.lightText, styles.listEmpty]}>
                No power changes in your area in the last 24 hours.
              </Text>
            </View>
          ) : (
            activity.data.map((item) => (
              <View key={`${item.neighborhoodId}-${item.status}-${item.at}`} style={styles.listRow}>
                <View style={styles.listLeft}>
                  <View style={[styles.avatar, { backgroundColor: item.status === "ON" ? colors.powerOn : colors.powerOff }]}>
                    <Icon name="user" />
                  </View>
                  <View style={styles.listText}>
                    <Text style={[type.boldText, styles.listTitle]}>
                      {item.status === "ON" ? "Power restored" : "Power went out"}
                    </Text>
                    <Text style={[type.lightText, { color: colors.muted }]} numberOfLines={1}>
                      {item.isCurrentNeighborhood ? `${item.neighborhood} (your area)` : `${item.neighborhood}, ${item.town}`}
                    </Text>
                  </View>
                </View>
                <Text style={[type.lightText, { color: colors.muted }]}>{timeAgo(item.at)}</Text>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Map quick look */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="View Heatmap"
        onPress={() => router.navigate({ pathname: "/map", params: { view: "heatmap" } })}
        style={styles.map}
      >
        <Image
          source={require("../../assets/images/heatmap-preview.jpg")}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <LinearGradient
          colors={[alpha(colors.black, 0), alpha(colors.black, 0.6)]}
          style={styles.mapOverlay}
        >
          <View style={styles.rowBetween}>
            <Text style={styles.mapLabel}>View Heatmap</Text>
            <Icon name="arrowRight" />
          </View>
        </LinearGradient>
      </Pressable>
    </Screen>
  );
};

const styles = StyleSheet.create({
  main: {
    gap: 24,
    paddingHorizontal: 16,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusSection: {
    gap: 8,
  },
  caption: {
    color: colors.bg,
    opacity: 0.7,
  },
  change: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  neighborhood: {
    fontFamily: fonts.semibold,
    fontSize: 20,
    lineHeight: 24,
    color: colors.bg,
  },
  hero: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#99B3D5",
    borderRadius: 12,
    backgroundColor: "#D3E2ED",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  badgeLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.primary,
  },
  bulb: {
    marginTop: 16,
    paddingBottom: 7,
  },
  heroTitle: {
    marginTop: 16,
    fontFamily: fonts.semibold,
    fontSize: 24,
    lineHeight: 29,
    textAlign: "center",
    color: colors.bg,
  },
  heroSubtitle: {
    marginTop: 4,
    textAlign: "center",
    color: colors.bg,
    opacity: 0.7,
  },
  stats: {
    marginTop: 24,
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
    gap: 75,
    borderTopWidth: 1,
    borderTopColor: colors.stroke,
    paddingTop: 24,
  },
  stat: {
    alignItems: "center",
  },
  statLabel: {
    textAlign: "center",
    color: colors.muted,
  },
  statValue: {
    textAlign: "center",
    color: colors.navy,
  },
  section: {
    gap: 16,
  },
  report: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderRadius: 24,
    boxShadow: shadows.card,
  },
  pressed: {
    opacity: 0.85,
  },
  activityTitle: {
    color: colors.bg,
    opacity: 0.8,
  },
  seeHistory: {
    color: colors.bg,
    opacity: 0.7,
  },
  list: {
    gap: 1,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: alpha(colors.stroke, 0.3),
    borderRadius: 8,
    backgroundColor: alpha(colors.stroke, 0.3),
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    padding: 16,
  },
  listLeft: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  listText: {
    flexShrink: 1,
  },
  listState: {
    flex: 1,
    paddingVertical: 8,
  },
  listEmpty: {
    flex: 1,
    textAlign: "center",
    color: colors.muted,
  },
  listTitle: {
    color: colors.bg,
    opacity: 0.9,
  },
  map: {
    height: 192,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: alpha(colors.stroke, 0.3),
    borderRadius: 8,
    backgroundColor: colors.mapBg,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "flex-end",
    padding: 16,
  },
  mapLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: colors.white,
  },
});

export default Dashboard;
