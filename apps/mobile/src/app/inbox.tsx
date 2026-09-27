import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import BackHeader from "../components/layout/BackHeader";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import { EmptyView, ErrorView, LoadingView } from "../components/ui/StateViews";
import { useApi } from "../hooks/useApi";
import { notificationsApi } from "../services/api";
import type { InboxNotification } from "../services/api";
import { timeAgo } from "../utils/format";
import { errorMessage } from "../utils/validation";
import { alpha, colors, fonts, type } from "../theme";

const isOutage = (n: InboxNotification) => n.title.toLowerCase().includes("outage");

// Notifications inbox (no Figma frame; Profile screen family). Lists the alerts
// the server sent: outage/restoration pushes, broadcasts and in-app messages.
const Inbox = () => {
  const inbox = useApi(() => notificationsApi.list(1, 50));
  const items = inbox.data?.data ?? [];
  const unread = items.filter((n) => !n.opened).length;

  const markRead = async (item: InboxNotification) => {
    if (item.opened) return;
    inbox.mutate((current) =>
      current && { ...current, data: current.data.map((n) => (n.id === item.id ? { ...n, opened: true } : n)) },
    );
    await notificationsApi.markRead(item.id).catch(() => {});
  };

  const markAllRead = async () => {
    inbox.mutate((current) => current && { ...current, data: current.data.map((n) => ({ ...n, opened: true })) });
    try {
      await notificationsApi.markAllRead();
    } catch (error) {
      Alert.alert("Couldn't update notifications", errorMessage(error));
      void inbox.refresh();
    }
  };

  const remove = (item: InboxNotification) =>
    Alert.alert("Delete notification?", item.title, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await notificationsApi.remove(item.id);
            inbox.mutate((current) => current && { ...current, data: current.data.filter((n) => n.id !== item.id) });
          } catch (error) {
            Alert.alert("Couldn't delete notification", errorMessage(error));
          }
        },
      },
    ]);

  return (
    <Screen top={23} bottom={40} onRefresh={inbox.refresh} refreshing={inbox.refreshing}>
      <BackHeader height={63} />

      <View style={styles.main}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text accessibilityRole="header" style={[type.h1, { color: colors.bg }]}>
              Notifications
            </Text>
            <Text style={styles.subtitle}>
              {unread > 0 ? `${unread} unread` : "You're all caught up."}
            </Text>
          </View>
          {unread > 0 && (
            <Pressable accessibilityRole="button" onPress={markAllRead} hitSlop={8}>
              <Text style={[type.boldText, { color: colors.primary }]}>Mark all read</Text>
            </Pressable>
          )}
        </View>

        {inbox.loading ? (
          <LoadingView />
        ) : inbox.error && !inbox.data ? (
          <ErrorView message={inbox.error.message} onRetry={inbox.refresh} />
        ) : items.length === 0 ? (
          <EmptyView
            icon="bell"
            title="No notifications yet"
            message="Outage and restoration alerts for your neighborhoods will show up here."
          />
        ) : (
          <View style={styles.list}>
            {items.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`${item.opened ? "" : "Unread. "}${item.title}. ${item.body}`}
                accessibilityHint="Long press to delete"
                onPress={() => void markRead(item)}
                onLongPress={() => remove(item)}
                style={[styles.row, !item.opened && styles.rowUnread]}
              >
                <View style={[styles.icon, { backgroundColor: isOutage(item) ? colors.powerOff : colors.primary }]}>
                  <Icon name={isOutage(item) ? "plugOff" : "bolt"} />
                </View>
                <View style={styles.text}>
                  <View style={styles.rowTop}>
                    <Text style={[type.boldText, styles.title]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[type.lightText, { color: colors.muted }]}>{timeAgo(item.createdAt)}</Text>
                  </View>
                  <Text style={styles.body}>{item.body}</Text>
                </View>
                {!item.opened && <View style={styles.dot} />}
              </Pressable>
            ))}
          </View>
        )}

        {items.length > 0 && <Text style={styles.hint}>Tip: press and hold a notification to delete it.</Text>}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  main: {
    gap: 24,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  subtitle: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.bg,
    opacity: 0.7,
  },
  list: {
    gap: 1,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: alpha(colors.stroke, 0.6),
    borderRadius: 8,
    backgroundColor: alpha(colors.stroke, 0.6),
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: colors.white,
    padding: 16,
  },
  rowUnread: {
    backgroundColor: alpha(colors.primary, 0.05),
  },
  icon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    flexShrink: 1,
    color: colors.bg,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.slate,
  },
  dot: {
    width: 8,
    height: 8,
    marginTop: 6,
    borderRadius: 9999,
    backgroundColor: colors.primary,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
    color: colors.gray500,
  },
});

export default Inbox;
