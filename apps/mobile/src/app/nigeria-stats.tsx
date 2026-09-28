import type { ReactNode } from "react";
import { Text, View } from "react-native";
import AppHeader from "../components/layout/AppHeader";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import type { GlyphName } from "../components/icons/glyphs";
import { EmptyView, ErrorView, LoadingView } from "../components/ui/StateViews";
import { useApi } from "../hooks/useApi";
import { analyticsApi } from "../services/api";
import type { OutageStatistics, PowerStatistics } from "../services/api";
import { formatDuration, lagosDateString, lagosDayRange } from "../utils/format";
import { fonts, type } from "../theme";
import { makeStyles, useTheme } from "../theme/ThemeContext";

interface NigeriaStatsData {
  today: PowerStatistics;
  week: PowerStatistics;
  activeOutages: number;
  outagesWeek: OutageStatistics;
}

const fetchNigeriaStats = async (): Promise<NigeriaStatsData> => {
  const now = new Date();
  const nowIso = now.toISOString();
  const todayFrom = lagosDayRange(lagosDateString(now)).from;
  const sixDaysAgo = new Date(now.getTime() - 6 * 86_400_000);
  const weekFrom = lagosDayRange(lagosDateString(sixDaysAgo)).from;

  const [today, week, outagesGlobal, outagesWeek] = await Promise.all([
    analyticsApi.power({ startDate: todayFrom, endDate: nowIso }),
    analyticsApi.power({ startDate: weekFrom, endDate: nowIso }),
    // No date filter: activeOutages here counts every outage still open right now,
    // not just ones that started in the window below.
    analyticsApi.outages({}),
    analyticsApi.outages({ startDate: weekFrom, endDate: nowIso }),
  ]);

  return { today, week, activeOutages: outagesGlobal.activeOutages, outagesWeek };
};

const Section = ({ title, children }: { title: string; children: ReactNode }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={[type.buttonText, { color: colors.bg }]}>
        {title}
      </Text>
      {children}
    </View>
  );
};

const NumberTile = ({
  icon,
  value,
  label,
  color,
}: {
  icon: GlyphName;
  value: string | number;
  label: string;
  color: string;
}) => {
  const styles = useStyles();
  return (
    <View style={[styles.tile, { borderColor: color }]}>
      <Icon name={icon} width={18} color={color} />
      <Text style={[styles.tileValue, { color }]}>{value}</Text>
      <Text style={[styles.tileLabel, { color }]}>{label}</Text>
    </View>
  );
};

const SectionEmpty = ({ message }: { message: string }) => {
  const styles = useStyles();
  return <Text style={styles.sectionEmpty}>{message}</Text>;
};

const ReportSplit = ({ stats, emptyMessage }: { stats: PowerStatistics; emptyMessage: string }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  if (stats.totalReports === 0) return <SectionEmpty message={emptyMessage} />;
  return (
    <>
      <View style={styles.tileRow}>
        <NumberTile icon="bolt" value={stats.onReports} label="Power ON" color={colors.powerOn} />
        <NumberTile icon="plugOff" value={stats.offReports} label="Power OFF" color={colors.powerOff} />
      </View>
      <Text style={styles.sectionNote}>{stats.totalReports} reports in total</Text>
    </>
  );
};

// Nigeria-wide statistics (gap report item C8). No Figma frame; reached from the "Across
// Nigeria" card on the Map screen. Signed-in users only (Screen requires nav="map").
const NigeriaStats = () => {
  const { colors } = useTheme();
  const styles = useStyles();
  const stats = useApi(fetchNigeriaStats);
  const data = stats.data;

  const nothingToShow =
    !!data &&
    data.today.totalReports === 0 &&
    data.week.totalReports === 0 &&
    data.activeOutages === 0 &&
    data.outagesWeek.totalOutages === 0;

  return (
    <Screen header={<AppHeader back />} nav="map" onRefresh={stats.refresh} refreshing={stats.refreshing}>
      <View style={styles.main}>
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={[type.h1, { color: colors.bg }]}>
            Across Nigeria
          </Text>
          <Text style={styles.subtitle}>How power reporting looks nationwide right now.</Text>
        </View>

        {stats.loading ? (
          <LoadingView label="Loading national statistics…" />
        ) : stats.error && !data ? (
          <ErrorView message={stats.error.message} onRetry={stats.refresh} />
        ) : !data ? null : nothingToShow ? (
          <EmptyView
            icon="info"
            title="No data yet"
            message="Nobody has reported power anywhere in Nigeria recently. Reports you and others file will show up here."
          />
        ) : (
          <>
            <Section title="Reports Today">
              <ReportSplit stats={data.today} emptyMessage="No reports filed yet today." />
            </Section>

            <Section title="Reports This Week">
              <ReportSplit stats={data.week} emptyMessage="No reports filed yet this week." />
            </Section>

            <Section title="Outages">
              {data.activeOutages === 0 && data.outagesWeek.totalOutages === 0 ? (
                <SectionEmpty message="No outages reported in the last 7 days." />
              ) : (
                <>
                  <View style={styles.tileRow}>
                    <NumberTile
                      icon="plugOff"
                      value={data.activeOutages}
                      label="Active Now"
                      color={colors.powerOff}
                    />
                    <NumberTile
                      icon="timer"
                      value={data.outagesWeek.totalOutages}
                      label="Last 7 Days"
                      color={colors.navy}
                    />
                  </View>
                  {data.outagesWeek.totalOutages > 0 && (
                    <Text style={styles.sectionNote}>
                      Average outage lasts {formatDuration(data.outagesWeek.averageDurationMinutes)}
                    </Text>
                  )}
                </>
              )}
            </Section>

            {data.outagesWeek.topNeighborhoods.length > 0 && (
              <Section title="Top Neighborhoods by Outages">
                <View style={styles.list}>
                  {data.outagesWeek.topNeighborhoods.slice(0, 5).map((n) => (
                    <View key={n.neighborhoodId} style={styles.listRow}>
                      <View style={styles.listText}>
                        <Text style={[type.boldText, { color: colors.ink }]} numberOfLines={1}>
                          {n.neighborhoodName}
                        </Text>
                        <Text style={styles.listSub}>
                          Average {formatDuration(n.averageDurationMinutes)} per outage
                        </Text>
                      </View>
                      <Text style={[type.boldText, { color: colors.danger }]}>
                        {n.outageCount} {n.outageCount === 1 ? "outage" : "outages"}
                      </Text>
                    </View>
                  ))}
                </View>
              </Section>
            )}
          </>
        )}
      </View>
    </Screen>
  );
};

const useStyles = makeStyles((c) => ({
  main: {
    gap: 28,
  },
  heading: {
    gap: 8,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: c.bg,
    opacity: 0.7,
  },
  section: {
    gap: 12,
  },
  tileRow: {
    flexDirection: "row",
    gap: 12,
  },
  tile: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: c.card,
    paddingVertical: 16,
  },
  tileValue: {
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 29,
  },
  tileLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 17,
  },
  sectionNote: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
    color: c.muted,
  },
  sectionEmpty: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 8,
    backgroundColor: c.surface,
    padding: 16,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: c.gray500,
  },
  list: {
    gap: 1,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 8,
    backgroundColor: c.border,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: c.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listText: {
    flex: 1,
    gap: 2,
  },
  listSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: c.muted,
  },
}));

export default NigeriaStats;
