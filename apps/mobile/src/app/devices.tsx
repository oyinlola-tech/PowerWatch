import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import AppHeader from "../components/layout/AppHeader";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import Button from "../components/ui/Button";
import { Divider, Section } from "../components/ui/ListSection";
import { ErrorView, LoadingView } from "../components/ui/StateViews";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { authApi } from "../services/api";
import type { SignInSession } from "../services/api";
import { formatDateTime, timeAgo } from "../utils/format";
import { errorMessage } from "../utils/validation";
import { alpha, fonts, type } from "../theme";
import { makeStyles, useTheme } from "../theme/ThemeContext";

/** Turn a raw user agent into something readable, e.g. "Android · okhttp" */
const describeDevice = (session: SignInSession) => {
  if (session.deviceName) return session.deviceName;
  const agent = session.browser ?? "";
  if (/android/i.test(agent)) return "Android device";
  if (/iphone|ipad|ios|darwin/i.test(agent)) return "iPhone or iPad";
  if (/windows/i.test(agent)) return "Windows computer";
  if (/mac os/i.test(agent)) return "Mac";
  if (/linux/i.test(agent)) return "Linux computer";
  return agent ? agent.slice(0, 40) : "Unknown device";
};

// Signed-in devices (no Figma frame; Profile screen family)
const Devices = () => {
  const { colors } = useTheme();
  const styles = useStyles();
  const { signOut } = useAuth();
  const sessions = useApi(authApi.sessions);
  const [signingOutAll, setSigningOutAll] = useState(false);

  const list = [...(sessions.data ?? [])].sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));
  const others = list.filter((s) => !s.isCurrent);

  const revoke = (session: SignInSession) =>
    Alert.alert("Sign out this device?", `${describeDevice(session)} will need to log in again.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          try {
            await authApi.revokeSession(session.id);
            sessions.mutate((current) => current?.filter((s) => s.id !== session.id));
          } catch (error) {
            Alert.alert("Couldn't sign out that device", errorMessage(error));
          }
        },
      },
    ]);

  const signOutEverywhere = () =>
    Alert.alert(
      "Sign out everywhere?",
      "This signs out every device, including this one. You'll need to log in again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out all",
          style: "destructive",
          onPress: async () => {
            setSigningOutAll(true);
            try {
              await authApi.logoutAll();
            } catch {
              // Still end the local session below
            }
            await signOut();
          },
        },
      ],
    );

  return (
    <Screen header={<AppHeader back />} nav="settings" onRefresh={sessions.refresh} refreshing={sessions.refreshing}>
      <View style={styles.main}>
        <View style={styles.titleBlock}>
          <Text accessibilityRole="header" style={[type.h1, { color: colors.bg }]}>
            Signed-in Devices
          </Text>
          <Text style={styles.subtitle}>
            Phones and browsers signed in to your account. Sign out any you don&apos;t recognise.
          </Text>
        </View>

        {sessions.loading ? (
          <LoadingView />
        ) : sessions.error && !sessions.data ? (
          <ErrorView message={sessions.error.message} onRetry={sessions.refresh} />
        ) : (
          <Section title="ACTIVE SESSIONS">
            {list.map((session, index) => (
              <View key={session.id}>
                {index > 0 && <Divider />}
                <View style={styles.row}>
                  <Icon name={session.isCurrent ? "locate" : "person"} color={colors.slateIcon} />
                  <View style={styles.rowText}>
                    <View style={styles.nameRow}>
                      <Text style={[type.boldText, { color: colors.ink, flexShrink: 1 }]} numberOfLines={1}>
                        {describeDevice(session)}
                      </Text>
                      {session.isCurrent && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>This device</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.meta}>
                      Active {timeAgo(session.lastActivityAt)}
                      {session.ipAddress ? ` · ${session.ipAddress}` : ""}
                    </Text>
                    <Text style={styles.meta}>Signed in {formatDateTime(session.createdAt)}</Text>
                  </View>
                  {!session.isCurrent && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Sign out ${describeDevice(session)}`}
                      onPress={() => revoke(session)}
                      hitSlop={8}
                    >
                      <Text style={[type.boldText, { color: colors.danger }]}>Sign out</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </Section>
        )}

        {sessions.data && (
          <View style={styles.danger}>
            <Text style={styles.dangerText}>
              {others.length > 0
                ? `You're signed in on ${others.length} other ${others.length === 1 ? "device" : "devices"}.`
                : "This is the only device signed in."}
            </Text>
            <Button
              label="Sign Out Everywhere"
              height={48}
              loading={signingOutAll}
              onPress={signOutEverywhere}
              style={styles.dangerButton}
            />
          </View>
        )}
      </View>
    </Screen>
  );
};

const useStyles = makeStyles((c) => ({
  main: {
    gap: 24,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    borderRadius: 9999,
    backgroundColor: alpha(c.primary, 0.1),
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    color: c.accent,
  },
  meta: {
    fontFamily: fonts.hankenMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    color: c.slate,
  },
  danger: {
    gap: 12,
    borderWidth: 1,
    borderColor: alpha(c.danger, 0.2),
    borderRadius: 8,
    backgroundColor: alpha(c.dangerTint, 0.1),
    padding: 16,
  },
  dangerText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: c.slate,
  },
  dangerButton: {
    backgroundColor: c.danger,
  },
}));

export default Devices;
