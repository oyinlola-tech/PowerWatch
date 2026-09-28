import { useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, Text, View } from "react-native";
import Icon from "../icons/Icon";
import GoogleTermsModal from "./GoogleTermsModal";
import { APPLE_SIGN_IN_ENABLED } from "../../config/features";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../services/api";
import { signInWithGoogle as googleNativeSignIn } from "../../services/googleAuth";
import { requestLocationForSignUp } from "../../services/location";
import mixpanel from "../../services/mixpanel";
import { fonts, type } from "../../theme";
import { makeStyles, useTheme } from "../../theme/ThemeContext";

interface SocialButtonsProps {
  dividerLabel: string;
  /** Inter on login; the sign-up screen sets this label in Segoe UI */
  dividerFont?: string;
  /** Vertical padding around the divider: 40 on login, 32 on sign up */
  dividerPadding: number;
}

const APPLE_COMING_SOON_MESSAGE =
  "Sign in with Apple is coming soon. Please continue with Google or email for now.";

const SocialButtons = ({
  dividerLabel,
  dividerFont = fonts.regular,
  dividerPadding,
}: SocialButtonsProps) => {
  const { isDark } = useTheme();
  const styles = useStyles();
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  // Set once POST /auth/google returns 409 TERMS_REQUIRED, so "Agree & Continue" can
  // retry the same Google idToken without reopening the native sign-in UI.
  const [pendingIdToken, setPendingIdToken] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [termsSubmitting, setTermsSubmitting] = useState(false);

  const handleGoogle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const outcome = await googleNativeSignIn();
      if (!outcome.ok) {
        if (outcome.reason !== "cancelled") Alert.alert("Google sign-in", outcome.message);
        return;
      }

      try {
        await signInWithGoogle(outcome.idToken);
        // Success: the auth guard leaves this screen for the signed-in stack.
      } catch (error) {
        if (error instanceof ApiError && error.status === 409 && error.message === "TERMS_REQUIRED") {
          // No PowerWatch account for this Google account yet — ask for agreement, then retry.
          setPendingIdToken(outcome.idToken);
          setTermsError(null);
          return;
        }
        const message =
          error instanceof ApiError ? error.message : "Couldn't sign in with Google. Please try again.";
        Alert.alert("Couldn't sign in", message);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleAgreeToTerms = async () => {
    if (!pendingIdToken) return;
    setTermsSubmitting(true);
    setTermsError(null);
    try {
      const location = await requestLocationForSignUp();
      await signInWithGoogle(pendingIdToken, { acceptedTerms: true, location });
      mixpanel.track("sign_up_completed", { withLocation: Boolean(location), method: "google" });
      setPendingIdToken(null);
      // Success: the auth guard leaves this screen for the signed-in stack.
    } catch (error) {
      setTermsError(error instanceof ApiError ? error.message : "Couldn't create your account. Please try again.");
    } finally {
      setTermsSubmitting(false);
    }
  };

  const handleApple = () => {
    if (APPLE_SIGN_IN_ENABLED) {
      // TODO: once expo-apple-authentication is installed and configured, call the real
      // native Sign in with Apple flow here instead of the message below.
    }
    Alert.alert("Sign in with Apple", APPLE_COMING_SOON_MESSAGE);
  };

  return (
    <View>
      {/* Divider */}
      <View style={[styles.divider, { paddingVertical: dividerPadding }]}>
        <View style={styles.line} />
        <Text style={[styles.dividerLabel, { fontFamily: dividerFont }]}>{dividerLabel}</Text>
      </View>

      {/* Social buttons */}
      <View style={styles.column}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
          accessibilityState={{ disabled: busy, busy }}
          onPress={() => void handleGoogle()}
          disabled={busy}
          style={({ pressed }) => [
            styles.button,
            isDark ? styles.googleDark : styles.googleLight,
            pressed && !busy && styles.pressed,
            busy && styles.disabled,
          ]}
        >
          {busy ? (
            <ActivityIndicator color={isDark ? "#E3E3E3" : "#1F1F1F"} />
          ) : (
            <>
              <Icon name="google" />
              <Text style={[type.boldText, styles.label, { color: isDark ? "#E3E3E3" : "#1F1F1F" }]}>
                Continue with Google
              </Text>
            </>
          )}
        </Pressable>

        {Platform.OS === "ios" && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign in with Apple"
            onPress={handleApple}
            style={({ pressed }) => [
              styles.button,
              isDark ? styles.appleDark : styles.appleLight,
              pressed && styles.pressed,
            ]}
          >
            <Icon name="apple" color={isDark ? "#000000" : "#FFFFFF"} />
            <Text style={[type.boldText, styles.label, { color: isDark ? "#000000" : "#FFFFFF" }]}>
              Sign in with Apple
            </Text>
          </Pressable>
        )}
      </View>

      <GoogleTermsModal
        visible={Boolean(pendingIdToken)}
        loading={termsSubmitting}
        error={termsError}
        onAgree={() => void handleAgreeToTerms()}
        onCancel={() => {
          setPendingIdToken(null);
          setTermsError(null);
        }}
      />
    </View>
  );
};

const useStyles = makeStyles((c) => ({
  divider: {
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: c.border,
  },
  dividerLabel: {
    // Sits on the screen, masking the divider line (Figma white on #FBFEFF)
    backgroundColor: c.screenBg,
    paddingHorizontal: 16,
    fontSize: 14,
    lineHeight: 20,
    color: c.gray400,
  },
  column: {
    gap: 12,
  },
  button: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 12,
  },
  // Google's official "neutral" button colours (brand guidelines), not the app palette.
  googleLight: {
    borderWidth: 1,
    borderColor: "#747775",
    backgroundColor: "#FFFFFF",
  },
  googleDark: {
    borderWidth: 1,
    borderColor: "#8E918F",
    backgroundColor: "#131314",
  },
  // Apple's "Black" / "White" Sign in with Apple button styles, picked for contrast
  // against the screen behind them rather than the app's own light/dark tokens.
  appleLight: {
    backgroundColor: "#000000",
  },
  appleDark: {
    backgroundColor: "#FFFFFF",
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.7,
  },
  label: {
    textAlign: "center",
  },
}));

export default SocialButtons;
