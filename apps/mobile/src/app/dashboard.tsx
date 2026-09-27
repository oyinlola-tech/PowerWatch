import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import LogoHeader from "../components/layout/LogoHeader";
import NavBar from "../components/layout/NavBar";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import { changeNeighborhood, notAvailableYet, reportPower } from "../services/navigation";
import type { PowerStatus } from "../types/power";
import { alpha, colors, fonts, shadows, type } from "../theme";

interface ActivityReport {
  id: string;
  status: PowerStatus;
  area: string;
  time: string;
}

// Replace with data fetched from your backend
const status = { status: "on" as PowerStatus, confirmedBy: 124, confidence: 98, lastUpdate: "2m ago" };

const activity: ActivityReport[] = [
  { id: "1", status: "on", area: "Henry Gorge Area", time: "Just now" },
  { id: "2", status: "off", area: "Adeta Area", time: "5m ago" },
];

// Figma "Home Screen (Status Hub)" (33:910)
const Dashboard = () => {
  const isOn = status.status === "on";

  return (
    <Screen top={41} bottom={112} contentStyle={styles.main} overlay={<NavBar active="dashboard" />}>
      <LogoHeader
        right={
          <Pressable accessibilityRole="button" accessibilityLabel="Location" hitSlop={8}>
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
          Adewole Estate
        </Text>

        <View style={styles.hero}>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeLabel}>Electricity Status: {isOn ? "On" : "Off"}</Text>
          </View>

          <View style={styles.bulb}>
            <Icon name="bulb" color={isOn ? colors.powerOn : colors.powerOff} />
          </View>

          <Text style={styles.heroTitle}>{isOn ? "Power is Live" : "Power is Out"}</Text>
          <Text style={[type.lightText, styles.heroSubtitle]}>
            Confirmed by {status.confirmedBy} neighbors
          </Text>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={[type.lightText, styles.statLabel]}>CONFIDENCE</Text>
              <Text style={[type.buttonText, styles.statValue]}>{status.confidence}%</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[type.lightText, styles.statLabel]}>LAST UPDATE</Text>
              <Text style={[type.buttonText, styles.statValue]}>{status.lastUpdate}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Reporting actions */}
      <View style={styles.section}>
        <Text style={[type.lightText, { color: colors.muted }]}>
          Something changed? Report it now
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => reportPower("on")}
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
          onPress={() => reportPower("off")}
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
          {activity.map((report) => (
            <View key={report.id} style={styles.listRow}>
              <View style={styles.listLeft}>
                <View style={styles.avatar}>
                  <Icon name="user" />
                </View>
                <View>
                  <Text style={[type.boldText, styles.listTitle]}>
                    Neighbor reported {report.status === "on" ? "ON" : "OFF"}
                  </Text>
                  <Text style={[type.lightText, { color: colors.muted }]}>{report.area}</Text>
                </View>
              </View>
              <Text style={[type.lightText, { color: colors.muted }]}>{report.time}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Map quick look */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="View Heatmap"
        onPress={() => notAvailableYet("Heatmap")}
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
