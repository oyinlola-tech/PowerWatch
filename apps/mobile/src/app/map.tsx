import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import LogoHeader from "../components/layout/LogoHeader";
import NavBar from "../components/layout/NavBar";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import MapView from "../components/map/MapView";
import type { MapMarker } from "../components/map/mapHtml";
import { EmptyView, ErrorView, LoadingView } from "../components/ui/StateViews";
import { useUser } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { locationsApi } from "../services/api";
import type { ApiPowerStatus, StatusMapByLga, StatusMapByState } from "../services/api";
import { changeNeighborhood } from "../services/navigation";
import { timeAgo } from "../utils/format";
import { alpha, fonts, shadows, type } from "../theme";
import type { Palette } from "../theme";
import { makeStyles, useTheme } from "../theme/ThemeContext";

type View_ = "area" | "heatmap";

// Nigeria, for the first frame before markers arrive
const NIGERIA = { latitude: 9.082, longitude: 8.6753, zoom: 5 };

const statusColors = (colors: Palette): Record<ApiPowerStatus, string> => ({
  ON: colors.powerOn,
  OFF: colors.powerOff,
  UNKNOWN: colors.gray400,
});

/**
 * Most neighborhoods only have their LGA's coordinates, so they would sit on top
 * of each other. Spread shared points on a small spiral so each stays tappable.
 */
const spreadOverlapping = (points: { id: string; latitude: number; longitude: number; color: string }[]) => {
  const seen = new Map<string, number>();
  return points.map((p) => {
    const key = `${p.latitude.toFixed(4)},${p.longitude.toFixed(4)}`;
    const n = seen.get(key) ?? 0;
    seen.set(key, n + 1);
    if (n === 0) return p;
    const angle = n * 2.399963; // golden angle
    const distance = 0.004 * Math.sqrt(n);
    return { ...p, latitude: p.latitude + distance * Math.sin(angle), longitude: p.longitude + distance * Math.cos(angle) };
  });
};

/** 0% out -> green, 100% out -> red; no data -> gray */
const heatColor = (percent: number | null, colors: Palette) => {
  if (percent === null) return colors.gray400;
  if (percent >= 60) return colors.powerOff;
  if (percent >= 30) return "#F59E0B";
  if (percent > 0) return "#EAB308";
  return colors.powerOn;
};

const CountCard = ({ on, count, label }: { on: boolean; count: number; label: string }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={[styles.countCard, { borderColor: on ? colors.timelineOn : colors.danger }]}>
      <Icon name="bulb" width={18} color={on ? colors.timelineOn : alpha(colors.danger, 0.4)} />
      <Text style={[styles.countValue, { color: on ? colors.timelineOn : colors.danger }]}>{count}</Text>
      <Text style={[styles.countLabel, { color: on ? colors.timelineOn : colors.danger }]}>{label}</Text>
    </View>
  );
};

const AreaView = ({ data, selected, onSelect }: { data: StatusMapByLga; selected: number | null; onSelect: (id: number) => void }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  const statusColor = statusColors(colors);
  const counts = data.neighborhoods.reduce(
    (acc, n) => ({ ...acc, [n.status]: acc[n.status] + 1 }),
    { ON: 0, OFF: 0, UNKNOWN: 0 } as Record<ApiPowerStatus, number>,
  );
  const reporting = counts.ON + counts.OFF;
  // Outages first, then areas with power, then areas nobody has reported
  const order: Record<ApiPowerStatus, number> = { OFF: 0, ON: 1, UNKNOWN: 2 };
  const sorted = [...data.neighborhoods].sort((a, b) => order[a.status] - order[b.status] || a.name.localeCompare(b.name));

  return (
    <>
      <View style={styles.counts}>
        <CountCard on count={counts.ON} label="Light ON" />
        <CountCard on={false} count={counts.OFF} label="Light OFF" />
      </View>

      <View style={styles.pill}>
        <Icon name="groups" color={colors.gray500} width={20} />
        <Text style={styles.pillText}>
          {reporting} of {data.neighborhoods.length} areas reporting in {data.lga.name}
        </Text>
      </View>

      <View style={styles.list}>
        {sorted.map((n) => (
          <Pressable
            key={n.id}
            accessibilityRole="button"
            accessibilityLabel={`${n.name}, ${n.status === "UNKNOWN" ? "no reports" : `power ${n.status}`}`}
            onPress={() => onSelect(n.id)}
            style={[styles.listRow, selected === n.id && styles.listRowSelected]}
          >
            <View style={[styles.dot, { backgroundColor: statusColor[n.status] }]} />
            <View style={styles.listText}>
              <Text style={[type.boldText, { color: colors.ink }]} numberOfLines={1}>
                {n.name}
              </Text>
              <Text style={styles.listSub} numberOfLines={1}>
                {n.town}
              </Text>
            </View>
            <Text style={[styles.listStatus, { color: statusColor[n.status] }]}>
              {n.status === "OFF" ? `Out ${timeAgo(n.outageSince)}` : n.status === "ON" ? "Power ON" : "No reports"}
            </Text>
          </Pressable>
        ))}
      </View>
    </>
  );
};

const HeatmapView = ({ data }: { data: StatusMapByState }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  const sorted = [...data.lgas].sort((a, b) => (b.outagePercent ?? -1) - (a.outagePercent ?? -1));
  return (
    <View style={styles.list}>
      {sorted.map((lga) => (
        <View key={lga.id} style={styles.listRow}>
          <View style={[styles.dot, { backgroundColor: heatColor(lga.outagePercent, colors) }]} />
          <View style={styles.listText}>
            <Text style={[type.boldText, { color: colors.ink }]} numberOfLines={1}>
              {lga.name}
            </Text>
            <Text style={styles.listSub}>
              {lga.neighborhoodsOn + lga.neighborhoodsOff > 0
                ? `${lga.neighborhoodsOff} of ${lga.neighborhoodsOn + lga.neighborhoodsOff} reporting areas out`
                : "No reports yet"}
            </Text>
          </View>
          <Text style={[styles.listStatus, { color: heatColor(lga.outagePercent, colors) }]}>
            {lga.outagePercent === null ? "—" : `${lga.outagePercent}% out`}
          </Text>
        </View>
      ))}
    </View>
  );
};

// Map tab. No HI-FI frame exists; follows the Home screen layout and the
// "Map Screen" reference in docs/figma-export/extras (Light ON / Light OFF cards).
const PowerMap = () => {
  const user = useUser();
  const { colors } = useTheme();
  const styles = useStyles();
  const { view: initialView } = useLocalSearchParams<{ view?: string }>();
  const [view, setView] = useState<View_>(initialView === "heatmap" ? "heatmap" : "area");
  const [selected, setSelected] = useState<number | null>(null);

  const stateId = user.state?.id;
  const area = useApi(() => locationsApi.statusMapByLga(), `area-${user.lga?.id ?? 0}`);
  const heat = useApi(
    () => (stateId ? locationsApi.statusMapByState(stateId) : Promise.resolve(undefined)),
    `heat-${stateId ?? 0}`,
  );
  const current = view === "area" ? area : heat;

  const markers = useMemo<MapMarker[] | undefined>(() => {
    if (view === "area") {
      if (!area.data) return undefined;
      const points = area.data.neighborhoods
        .filter((n) => n.latitude !== null && n.longitude !== null)
        .map((n) => ({
          id: String(n.id),
          latitude: n.latitude!,
          longitude: n.longitude!,
          color: statusColors(colors)[n.status],
        }));
      return spreadOverlapping(points).map((p) => ({ ...p, radius: Number(p.id) === selected ? 12 : 8 }));
    }
    if (!heat.data) return undefined;
    return heat.data.lgas
      .filter((l) => l.latitude !== null && l.longitude !== null)
      .map((l) => ({
        id: `lga-${l.id}`,
        latitude: l.latitude!,
        longitude: l.longitude!,
        color: heatColor(l.outagePercent, colors),
        radius: 6 + Math.min(10, Math.sqrt(l.neighborhoods) * 2),
      }));
  }, [view, area.data, heat.data, selected, colors]);

  const handleMarkerPress = useCallback((id: string) => {
    if (!id.startsWith("lga-")) setSelected(Number(id));
  }, []);

  const approximate =
    view === "area" && area.data?.neighborhoods.some((n) => n.precision !== "neighborhood" && n.precision !== "none");

  const subtitle =
    view === "area"
      ? area.data
        ? `Power status across ${area.data.lga.name}`
        : "Power status near you"
      : heat.data
        ? `Share of areas without power across ${heat.data.state.name}`
        : "Outages across your state";

  return (
    <Screen
      top={41}
      bottom={112}
      contentStyle={styles.main}
      overlay={<NavBar active="map" />}
      onRefresh={current.refresh}
      refreshing={current.refreshing}
    >
      <LogoHeader />

      <View style={styles.titleBlock}>
        <Text accessibilityRole="header" style={[type.h1, { color: colors.bg }]}>
          Power Map
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* View switch */}
      <View style={styles.segment} accessibilityRole="tablist">
        {(["area", "heatmap"] as const).map((id) => {
          const active = view === id;
          return (
            <Pressable
              key={id}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => setView(id)}
              style={[styles.segmentItem, active && styles.segmentActive]}
            >
              <Text style={[type.boldText, { color: active ? colors.white : colors.bg }]}>
                {id === "area" ? "My Area" : "Heatmap"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!user.lga ? (
        <EmptyView
          icon="mapOutline"
          title="No neighborhood selected"
          message="Set your monitoring area to see power status around you."
        />
      ) : (
        <>
          <View style={styles.map}>
            <MapView
              latitude={NIGERIA.latitude}
              longitude={NIGERIA.longitude}
              zoom={NIGERIA.zoom}
              interactive
              markers={markers}
              fitToMarkers
              onMarkerPress={handleMarkerPress}
            />
            {current.loading && (
              <View style={styles.mapOverlay}>
                <LoadingView />
              </View>
            )}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            {view === "area" ? (
              <>
                <Legend color={colors.powerOn} label="ON" />
                <Legend color={colors.powerOff} label="OFF" />
                <Legend color={colors.gray400} label="No reports" />
              </>
            ) : (
              <>
                <Legend color={colors.powerOn} label="0%" />
                <Legend color="#EAB308" label="1-29%" />
                <Legend color="#F59E0B" label="30-59%" />
                <Legend color={colors.powerOff} label="60%+" />
              </>
            )}
          </View>
          {approximate && (
            <Text style={styles.note}>Areas without exact coordinates are placed near their LGA.</Text>
          )}

          {current.error && !current.data ? (
            <ErrorView message={current.error.message} onRetry={current.refresh} />
          ) : view === "area" && area.data ? (
            <AreaView data={area.data} selected={selected} onSelect={setSelected} />
          ) : view === "heatmap" && heat.data ? (
            <HeatmapView data={heat.data} />
          ) : null}

          <Pressable accessibilityRole="button" onPress={changeNeighborhood} style={styles.change}>
            <Icon name="pencil" color={colors.accent} />
            <Text style={[type.lightText, { color: colors.accent }]}>Change my neighborhood</Text>
          </Pressable>
        </>
      )}
    </Screen>
  );
};

const Legend = ({ color, label }: { color: string; label: string }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[type.boldText, { color: colors.muted }]}>{label}</Text>
    </View>
  );
};

const useStyles = makeStyles((c) => ({
  main: {
    gap: 20,
    paddingHorizontal: 16,
  },
  titleBlock: {
    gap: 8,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: c.bg,
    opacity: 0.7,
  },
  segment: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: c.borderButton,
    borderRadius: 24,
    backgroundColor: c.gray,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  segmentActive: {
    backgroundColor: c.primary,
  },
  map: {
    height: 320,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    backgroundColor: c.borderLight,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: alpha(c.card, 0.6),
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  note: {
    marginTop: -12,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: c.gray500,
  },
  counts: {
    flexDirection: "row",
    gap: 16,
  },
  countCard: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: c.card,
    paddingVertical: 16,
  },
  countValue: {
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 29,
  },
  countLabel: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 19,
  },
  pill: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 9999,
    backgroundColor: c.gray,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pillText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: c.gray500,
  },
  list: {
    gap: 1,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: alpha(c.stroke, 0.3),
    borderRadius: 8,
    backgroundColor: alpha(c.stroke, 0.3),
    boxShadow: shadows.card,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: c.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listRowSelected: {
    backgroundColor: alpha(c.primary, 0.06),
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 9999,
  },
  listText: {
    flex: 1,
  },
  listSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: c.muted,
  },
  listStatus: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  change: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
}));

export default PowerMap;
