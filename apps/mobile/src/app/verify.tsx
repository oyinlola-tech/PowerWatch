import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";
import { FormError } from "../components/ui/StateViews";
import { useAuth } from "../context/AuthContext";
import { ApiError, authApi } from "../services/api";
import { fonts, type } from "../theme";
import { makeStyles, useTheme } from "../theme/ThemeContext";

// Figma "Email Confirmation Wireframe" (3:554)
const RESEND_COOLDOWN_SECONDS = 30;

const OtpVerification = () => {
  const { user, refreshUser, signOut } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useStyles();
  const email = user?.email ?? "";
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [focused, setFocused] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const verify = async (digits: string[]) => {
    const code = digits.join("");
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await authApi.verifyEmail(email, code);
      await refreshUser();
      router.replace("/how-it-works");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't verify the code. Please try again.");
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setError(null);
    setNotice(null);
    try {
      await authApi.sendOtp(email);
      setNotice(`We sent a new code to ${email}.`);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't send a new code. Please try again.");
    }
  };

  const handleBack = () =>
    Alert.alert("Leave verification?", "You'll be signed out and can log in again later to finish.", [
      { text: "Stay", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => void signOut() },
    ]);

  const handleChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "");
    const next = [...otp];

    if (digits.length > 1) {
      // Pasted or autofilled code: spread it across the boxes
      digits.slice(0, 6 - index).split("").forEach((d, i) => (next[index + i] = d));
      setOtp(next);
      const last = Math.min(index + digits.length, 6) - 1;
      inputRefs.current[Math.min(last + 1, 5)]?.focus();
      if (next.every(Boolean)) void verify(next);
      return;
    }

    next[index] = digits;
    setOtp(next);
    if (digits && index < 5) inputRefs.current[index + 1]?.focus();
    if (digits && next.every(Boolean)) void verify(next);
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  return (
    <Screen top={48} bottom={14} contentStyle={styles.content}>
      {/* Back button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={handleBack}
        style={styles.back}
      >
        <Icon name="backArrowBold" color={colors.accent} />
      </Pressable>

      <View style={styles.body}>
        {/* Badge */}
        <View style={styles.badge}>
          <View style={styles.badgeInner}>
            <Icon name="envelopeOpen" />
          </View>
        </View>

        <Text accessibilityRole="header" style={[type.h1, styles.title]}>
          Verify your email
        </Text>
        <Text style={[type.boldText, styles.description]}>
          {email
            ? `We sent a 6-digit code to ${email}. Enter the code below to confirm your account.`
            : "We sent a 6-digit code to your email\naddress. Enter the code below to\nconfirm your account."}
        </Text>

        {/* Code */}
        <View style={styles.otp}>
          {otp.map((digit, index) => {
            const isActive = focused === index;
            return (
              <TextInput
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                accessibilityLabel={`Digit ${index + 1}`}
                keyboardType="number-pad"
                keyboardAppearance={isDark ? "dark" : "light"}
                inputMode="numeric"
                textContentType="oneTimeCode"
                maxLength={index === 0 ? 6 : 1}
                value={digit}
                onChangeText={(value) => handleChange(index, value)}
                onKeyPress={(e) => handleKeyPress(index, e.nativeEvent.key)}
                onFocus={() => setFocused(index)}
                onBlur={() => setFocused((current) => (current === index ? null : current))}
                style={[
                  styles.digit,
                  { borderColor: digit || isActive ? colors.primary : colors.border },
                  isActive && styles.digitActive,
                ]}
              />
            );
          })}
        </View>

        <FormError message={error} style={styles.message} />
        {notice && !error && <Text style={[type.boldText, styles.notice]}>{notice}</Text>}

        <Button
          label="Verify Email"
          shadow
          onPress={() => void verify(otp)}
          loading={submitting}
          style={styles.submit}
        />

        <Pressable
          accessibilityRole="button"
          onPress={resend}
          disabled={cooldown > 0}
          hitSlop={8}
          style={styles.resend}
        >
          <Text style={[type.boldText, { color: cooldown > 0 ? colors.gray400 : colors.accent }]}>
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Didn't get a code? Resend"}
          </Text>
        </Pressable>
      </View>

      {/* Footer logo */}
      <View style={styles.footer}>
        <Logo />
      </View>
    </Screen>
  );
};

const useStyles = makeStyles((c) => ({
  content: {
    paddingHorizontal: 24,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: c.tintBlue,
    borderRadius: 9999,
    backgroundColor: c.card,
  },
  body: {
    alignItems: "center",
    paddingTop: 81,
  },
  badge: {
    width: 128,
    height: 128,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: c.tintBlue,
  },
  badgeInner: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: c.primary,
  },
  title: {
    marginTop: 52,
    textAlign: "center",
    color: c.bg,
  },
  description: {
    marginTop: 16,
    maxWidth: 280,
    textAlign: "center",
    color: c.gray500,
  },
  otp: {
    marginTop: 62,
    width: "100%",
    maxWidth: 320,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  digit: {
    width: 44,
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    padding: 0,
    textAlign: "center",
    fontFamily: fonts.semibold,
    fontSize: 20,
    color: c.black,
  },
  digitActive: {
    backgroundColor: c.card,
    boxShadow: "0 0 0 2px rgba(0, 0, 0, 0.05)",
  },
  message: {
    marginTop: 24,
    alignSelf: "stretch",
  },
  notice: {
    marginTop: 24,
    textAlign: "center",
    color: c.powerOn,
  },
  submit: {
    marginTop: 40,
  },
  resend: {
    marginTop: 20,
  },
  footer: {
    marginTop: 60,
    alignItems: "center",
  },
}));

export default OtpVerification;
