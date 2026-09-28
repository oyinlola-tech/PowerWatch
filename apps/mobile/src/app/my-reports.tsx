import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import AppHeader from "../components/layout/AppHeader";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import { Divider } from "../components/ui/ListSection";
import Button from "../components/ui/Button";
import { EmptyView, ErrorView, LoadingView } from "../components/ui/StateViews";
import { useApi } from "../hooks/useApi";
import { reportsApi } from "../services/api";
import type { MyReport } from "../services/api";
import { goToDashboard } from "../services/navigation";
import { formatDateTime } from "../utils/format";
import { fonts, type } from "../theme";
import { makeStyles, useTheme } from "../theme/ThemeContext";
import { errorMessage } from "../utils/validation";

const PAGE_SIZE = 50;


interface ReportRowProps {
  report: MyReport;
  deleting: boolean;
  onDelete: () => void;
}

const ReportRow = ({ report, deleting, onDelete }: ReportRowProps) => {
  const { colors } = useTheme();
  const styles = useStyles();
  const isOn = report.reportType === "ON";
  const when = formatDateTime(report.timestamp);

  return (
    <View style={[styles.row, deleting && styles.rowBusy]}>
      <View style={[styles.tile, { backgroundColor: isOn ? colors.powerOn : colors.powerOff }]}>
        <Icon name={isOn ? "bolt" : "plugOff"} color={colors.white} />
      </View>
      <View style={styles.rowText}>
        <Text style={[type.boldText, { color: colors.bg }]}>Reported Power {isOn ? "ON" : "OFF"}</Text>
        <Text style={[type.lightText, styles.meta]} numberOfLines={1}>
          {`${report.neighborhood}, ${report.town}`}
        </Text>
        <Text style={[type.lightText, styles.meta]}>{when}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delete power ${isOn ? "ON" : "OFF"} report from ${when}`}
        accessibilityState={{ disabled: deleting, busy: deleting }}
        disabled={deleting}
        hitSlop={8}
        onPress={onDelete}
      >
        <Text style={[type.lightText, { color: colors.danger }]}>{deleting ? "Deleting..." : "Delete"}</Text>
      </Pressable>
    </View>
  );
};

// My Reports (no Figma frame; styled like the Profile and History screens)
const MyReports = () => {
  const styles = useStyles();
  const { data, error, loading, refreshing, refresh, mutate } = useApi(() => reportsApi.mine(1, PAGE_SIZE));
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Current page comes from the last response: a refetch on focus/refresh resets it to 1
  const page = data?.pagination.page ?? 1;
  const hasMore = !!data && data.pagination.totalPages > 1 && page < data.pagination.totalPages;

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const next = await reportsApi.mine(page + 1, PAGE_SIZE);
      mutate((current) => {
        if (!current) return next;
        const seen = new Set(current.data.map((r) => r.id));
        return { data: [...current.data, ...next.data.filter((r) => !seen.has(r.id))], pagination: next.pagination };
      });
    } catch (err) {
      Alert.alert("Couldn't load more reports", errorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  };

  const remove = async (report: MyReport) => {
    setDeletingId(report.id);
    try {
      await reportsApi.remove(report.id);
      mutate((current) =>
        current && {
          data: current.data.filter((r) => r.id !== report.id),
          pagination: { ...current.pagination, total: Math.max(0, current.pagination.total - 1) },
        },
      );
    } catch (err) {
      Alert.alert("Couldn't delete report", errorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const confirmRemove = (report: MyReport) =>
    Alert.alert("Delete this report?", "It will no longer count towards your neighborhood's status.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => void remove(report) },
    ]);

  const renderBody = () => {
    if (loading) return <LoadingView label="Loading your reports" />;
    if (error && !data) return <ErrorView message={error.message} onRetry={() => void refresh()} />;
    if (!data || data.data.length === 0) {
      return (
        <View style={styles.empty}>
          <EmptyView title="No reports yet" message="When you report power ON or OFF, it will show up here." />
          <Button label="Go to Home" onPress={goToDashboard} />
        </View>
      );
    }

    return (
      <>
        <View style={styles.card}>
          {data.data.map((report, index) => (
            <View key={report.id}>
              {index > 0 && <Divider />}
              <ReportRow
                report={report}
                deleting={deletingId === report.id}
                onDelete={() => confirmRemove(report)}
              />
            </View>
          ))}
        </View>

        {hasMore && (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: loadingMore, busy: loadingMore }}
            disabled={loadingMore}
            onPress={() => void handleLoadMore()}
            style={({ pressed }) => [styles.loadMore, (pressed || loadingMore) && { opacity: 0.7 }]}
          >
            <Text style={[type.boldText, styles.loadMoreLabel]}>{loadingMore ? "Loading..." : "Load more"}</Text>
          </Pressable>
        )}
      </>
    );
  };

  return (
    <Screen header={<AppHeader back />} nav="settings" onRefresh={() => void refresh()} refreshing={refreshing}>
      <View style={styles.main}>
        {/* Heading */}
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={[type.h1, styles.title]}>
            My Reports
          </Text>
          <Text style={styles.subtitle}>{"Reports you've submitted."}</Text>
        </View>

        {renderBody()}
      </View>
    </Screen>
  );
};

const useStyles = makeStyles((c) => ({
  main: {
    gap: 24,
  },
  heading: {
    gap: 8,
  },
  title: {
    color: c.bg,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: c.bg,
    opacity: 0.7,
  },
  card: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 8,
    backgroundColor: c.card,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
  },
  rowBusy: {
    opacity: 0.5,
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
  meta: {
    lineHeight: 16,
    color: c.muted,
  },
  empty: {
    gap: 8,
  },
  loadMore: {
    height: 51,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 8,
  },
  loadMoreLabel: {
    textAlign: "center",
    color: c.accent,
  },
}));

export default MyReports;
