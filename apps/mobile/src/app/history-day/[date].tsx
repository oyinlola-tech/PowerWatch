import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import AppHeader from "../../components/layout/AppHeader";
import Screen from "../../components/layout/Screen";
import Icon from "../../components/icons/Icon";
import Button from "../../components/ui/Button";
import { EmptyView, ErrorView, LoadingView } from "../../components/ui/StateViews";
import { useUser } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import { ApiError, reportsApi } from "../../services/api";
import type { Outage, OutageDetail } from "../../services/api";
import { formatDuration, fullDayLabel, lagosDateString, lagosDayRange, lagosDateTime, lagosTime } from "../../utils/format";
import { fonts, shadows, type } from "../../theme";
import { makeStyles, useTheme } from "../../theme/ThemeContext";

/** "Today, June 14" / "Yesterday, June 13" / "Monday, June 12" for a YYYY-MM-DD date. */
const dayTitle = (date: string): string => {
  const today = lagosDateString();
  const yesterday = lagosDateString(new Date(Date.now() - 86_400_000));
  if (date === today) return `Today, ${fullDayLabel(date).split(", ")[1]}`;
  if (date === yesterday) return `Yesterday, ${fullDayLabel(date).split(", ")[1]}`;
  return fullDayLabel(date);
};

/** Minutes of [start, end] that fall inside [from, to). */
const clipMinutes = (startIso: string, endIso: string, fromIso: string, toIso: string): number => {
  const s = Math.max(new Date(startIso).getTime(), new Date(fromIso).getTime());
  const e = Math.min(new Date(endIso).getTime(), new Date(toIso).getTime());
  return Math.max(0, Math.round((e - s) / 60_000));
};

/** The outage's end instant, in ms: its endTime, or right now while still ongoing. */
const outageEndMs = (outage: Outage): number => (outage.endTime ? new Date(outage.endTime).getTime() : Date.now());

/** ISO instant for `outageEndMs`, for reuse with `clipMinutes`. */
const outageEndIso = (outage: Outage): string => new Date(outageEndMs(outage)).toISOString();

interface OutageRowProps {
  outage: Outage;
  from: string;
  to: string;
  onPress: () => void;
}

const OutageRow = ({ outage, from, to, onPress }: OutageRowProps) => {
  const { colors } = useTheme();
  const styles = useStyles();

  const ongoing = outage.endTime === null;
  const startsBeforeDay = new Date(outage.startTime).getTime() < new Date(from).getTime();
  const endsAfterDay = ongoing || new Date(outage.endTime!).getTime() > new Date(to).getTime();
  const spansBeyondDay = startsBeforeDay || endsAfterDay;

  const clipped = clipMinutes(outage.startTime, outageEndIso(outage), from, to);
  const fullMinutes = outage.duration ?? Math.round((outageEndMs(outage) - new Date(outage.startTime).getTime()) / 60_000);

  const startLabel = `${lagosTime(outage.startTime)}${startsBeforeDay ? " (prev day)" : ""}`;
  const endLabel = ongoing ? "Still ongoing" : `${lagosTime(outage.endTime!)}${endsAfterDay ? " (next day)" : ""}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Outage from ${startLabel} to ${endLabel}, confirmed by ${outage.reportCount} report${outage.reportCount === 1 ? "" : "s"}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.tile, { backgroundColor: colors.powerOff }]}>
        <Icon name="plugOff" color={colors.white} />
      </View>
      <View style={styles.rowText}>
        <View style={styles.rowTitleLine}>
          <Text style={[type.boldText, { color: colors.bg }]}>
            {startLabel} – {endLabel}
          </Text>
          {ongoing && (
            <View style={styles.ongoingBadge}>
              <Text style={styles.ongoingBadgeText}>ONGOING</Text>
            </View>
          )}
        </View>
        <Text style={[type.lightText, styles.meta]}>
          {formatDuration(clipped)} this day
          {spansBeyondDay ? ` · ${formatDuration(fullMinutes)} total` : ""}
        </Text>
        <Text style={[type.lightText, styles.meta]}>
          Confirmed by {outage.reportCount} {outage.reportCount === 1 ? "report" : "reports"}
        </Text>
      </View>
      <Icon name="chevronRight" color={colors.muted} width={14} />
    </Pressable>
  );
};

interface OutageDetailModalProps {
  outageId: string | null;
  onClose: () => void;
}

interface OutageDetailResult {
  data?: OutageDetail;
  error?: string;
}

const OutageDetailModal = ({ outageId, onClose }: OutageDetailModalProps) => {
  const { colors } = useTheme();
  const styles = useStyles();
  // Keyed by outage id, so reopening the same outage doesn't refetch.
  const [results, setResults] = useState<Record<string, OutageDetailResult>>({});

  // Fetch detail the first time a given outage is opened
  useEffect(() => {
    if (!outageId || outageId in results) return;
    let cancelled = false;
    reportsApi
      .outage(outageId)
      .then((data) => {
        if (!cancelled) setResults((r) => ({ ...r, [outageId]: { data } }));
      })
      .catch((err) => {
        if (!cancelled) {
          const message = err instanceof ApiError ? err.message : "Couldn't load this outage.";
          setResults((r) => ({ ...r, [outageId]: { error: message } }));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [outageId, results]);

  const visible = outageId !== null;
  const current = outageId ? results[outageId] : undefined;
  const loading = outageId !== null && !current;
  const reports = current?.data?.outageReports ?? [];

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <Text accessibilityRole="header" style={[type.h1, styles.modalTitle, { color: colors.bg }]}>
            Outage Reports
          </Text>
          <Text style={styles.modalSubtitle}>
            {current?.data
              ? `Reported by ${current.data.reportCount} ${current.data.reportCount === 1 ? "person" : "people"}`
              : "Times reports were filed for this outage."}
          </Text>

          {loading ? (
            <LoadingView label="Loading reports…" style={styles.modalState} />
          ) : current?.error ? (
            <ErrorView message={current.error} style={styles.modalState} />
          ) : reports.length === 0 ? (
            <Text style={styles.modalEmpty}>No report details available.</Text>
          ) : (
            <ScrollView style={styles.reportsList} contentContainerStyle={styles.reportsListContent}>
              {reports.map(({ report }) => (
                <View key={report.id} style={styles.reportRow}>
                  <View
                    style={[
                      styles.reportDot,
                      { backgroundColor: report.reportType === "ON" ? colors.powerOn : colors.powerOff },
                    ]}
                  />
                  <Text style={styles.reportText}>
                    Power {report.reportType} · {lagosDateTime(report.timestamp)}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          <Button label="Close" variant="secondary" height={48} onPress={onClose} style={styles.closeButton} />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// Pushed from History (item C7): outages for one day in the neighborhood the History
// screen is showing. No Figma frame; styled like My Reports / History's day cards.
const HistoryDay = () => {
  const { date } = useLocalSearchParams<{ date: string }>();
  const user = useUser();
  const { colors } = useTheme();
  const styles = useStyles();
  const [openOutageId, setOpenOutageId] = useState<string | null>(null);

  const { from, to } = lagosDayRange(date ?? lagosDateString());
  const neighborhoodId = user.neighborhoodId ?? undefined;

  const outages = useApi(
    () =>
      neighborhoodId
        ? reportsApi.outages({ neighborhoodId, from, to, limit: 100 }).then((r) => r.data)
        : Promise.resolve([] as Outage[]),
    `${date}-${neighborhoodId ?? 0}`,
  );

  // Earliest first, so the list reads as a timeline of the day
  const sorted = [...(outages.data ?? [])].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  return (
    <Screen header={<AppHeader back />} nav="history" onRefresh={outages.refresh} refreshing={outages.refreshing}>
      <View style={styles.main}>
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={[type.h1, { color: colors.bg }]}>
            {dayTitle(date ?? lagosDateString())}
          </Text>
          <Text style={styles.subtitle}>{user.neighborhood?.name ?? "Your neighborhood"}</Text>
        </View>

        {!neighborhoodId ? (
          <EmptyView
            icon="mapOutline"
            title="No neighborhood selected"
            message="Set your monitoring area to see its outage history."
          />
        ) : outages.loading ? (
          <LoadingView label="Loading outages…" />
        ) : outages.error && !outages.data ? (
          <ErrorView message={outages.error.message} onRetry={outages.refresh} />
        ) : sorted.length === 0 ? (
          <EmptyView icon="timer" title="No outages recorded this day" message="Power was on all day, or nobody reported an outage." />
        ) : (
          <View style={styles.listCard}>
            {sorted.map((outage, index) => (
              <View key={outage.id}>
                {index > 0 && <View style={styles.divider} />}
                <OutageRow outage={outage} from={from} to={to} onPress={() => setOpenOutageId(outage.id)} />
              </View>
            ))}
          </View>
        )}
      </View>

      <OutageDetailModal outageId={openOutageId} onClose={() => setOpenOutageId(null)} />
    </Screen>
  );
};

const useStyles = makeStyles((c) => ({
  main: {
    gap: 24,
  },
  heading: {
    gap: 4,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: c.bg,
    opacity: 0.7,
  },
  listCard: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 8,
    backgroundColor: c.card,
  },
  divider: {
    height: 1,
    backgroundColor: c.borderLight,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
  },
  rowPressed: {
    opacity: 0.7,
  },
  tile: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitleLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  ongoingBadge: {
    borderRadius: 9999,
    backgroundColor: c.dangerTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ongoingBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.4,
    color: c.danger,
  },
  meta: {
    lineHeight: 16,
    color: c.muted,
  },
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    backgroundColor: c.card,
    padding: 24,
    boxShadow: shadows.sheet,
  },
  modalTitle: {
    fontSize: 20,
    lineHeight: 25,
  },
  modalSubtitle: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: c.gray600,
  },
  modalState: {
    paddingVertical: 16,
  },
  modalEmpty: {
    marginTop: 16,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: c.gray500,
  },
  reportsList: {
    marginTop: 16,
    maxHeight: 240,
  },
  reportsListContent: {
    gap: 12,
  },
  reportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reportDot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
  },
  reportText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: c.gray600,
  },
  closeButton: {
    marginTop: 24,
  },
}));

export default HistoryDay;
