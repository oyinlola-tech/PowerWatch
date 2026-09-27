import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import LogoHeader from "../components/layout/LogoHeader";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import Button from "../components/ui/Button";
import { FormError } from "../components/ui/StateViews";
import TextField from "../components/ui/TextField";
import { ApiError, authApi } from "../services/api";
import { goBack } from "../services/navigation";
import { fonts, type } from "../theme";
import { makeStyles, useTheme } from "../theme/ThemeContext";
import { PASSWORD_HINT, passwordProblem } from "../utils/validation";

const RESEND_COOLDOWN = 30;


type Field = "code" | "password" | "confirmPassword";
type FieldErrors = Partial<Record<Field, string>>;

// Reset Password (no Figma frame; styled like the Login screen)
const ResetPassword = () => {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === "string" ? params.email : "";
  const { colors } = useTheme();
  const styles = useStyles();

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  // A code was just sent by the previous screen
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const clearError = (field: Field) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    setFormError(null);
    setNotice(null);
    if (!email) {
      setFormError("We don't know which account to reset. Go back and enter your email again.");
      return;
    }

    const next: FieldErrors = {};
    if (!/^\d{6}$/.test(code)) next.code = "Enter the 6-digit code from your email.";
    next.password = passwordProblem(password);
    if (!confirmPassword) next.confirmPassword = "Confirm your new password.";
    else if (confirmPassword !== password) next.confirmPassword = "Passwords don't match.";
    setErrors(next);
    if (next.code || next.password || next.confirmPassword) return;

    setLoading(true);
    try {
      await authApi.resetPassword(email, code, password);
      Alert.alert("Password updated", "You can now log in with your new password.");
      router.dismissTo("/login");
    } catch (error) {
      if (!(error instanceof ApiError)) {
        setFormError("Something went wrong. Please try again.");
        return;
      }
      const { code: codeError, password: passwordError, confirmPassword: confirmError } = error.fieldErrors;
      if (codeError || passwordError || confirmError) {
        setErrors({ code: codeError, password: passwordError, confirmPassword: confirmError });
      } else {
        // Includes 429 (too many wrong codes) and invalid/expired code messages
        setFormError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0 || resending) return;
    setFormError(null);
    setNotice(null);
    setResending(true);
    try {
      await authApi.forgotPassword(email);
      setNotice("If an account exists for that email, a new code is on its way.");
      setCooldown(RESEND_COOLDOWN);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Couldn't resend the code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const eyeToggle = (visible: boolean, toggle: () => void) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={visible ? "Hide password" : "Show password"}
      hitSlop={8}
      onPress={toggle}
      style={styles.eye}
    >
      <Icon name={visible ? "eye" : "eyeSlash"} color={colors.gray400} />
    </Pressable>
  );

  const canResend = !!email && cooldown <= 0 && !resending;

  return (
    <Screen top={37} bottom={40}>
      <LogoHeader style={styles.header} />

      <View style={styles.content}>
        {/* Heading */}
        <Text accessibilityRole="header" style={[type.h1, styles.title]}>
          Reset Password
        </Text>
        <Text style={styles.subtitle}>
          {email
            ? `If an account exists for ${email}, a 6-digit code is on its way. Enter it below with your new password.`
            : "Enter the 6-digit code from your email and choose a new password."}
        </Text>

        {/* Form */}
        <View style={styles.form}>
          <FormError message={formError} />
          {notice ? (
            <Text accessibilityLiveRegion="polite" style={styles.notice}>
              {notice}
            </Text>
          ) : null}

          <TextField
            label="Reset Code"
            icon="lock"
            borderColor={colors.primary}
            placeholder="123456"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            maxLength={6}
            value={code}
            onChangeText={(text) => {
              setCode(text.replace(/\D/g, ""));
              clearError("code");
            }}
            error={errors.code}
          />

          <TextField
            label="New Password"
            icon="lock"
            borderColor={colors.primary}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            textContentType="newPassword"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              clearError("password");
            }}
            hint={PASSWORD_HINT}
            error={errors.password}
            right={eyeToggle(showPassword, () => setShowPassword((v) => !v))}
          />

          <TextField
            label="Confirm Password"
            icon="lock"
            borderColor={colors.primary}
            placeholder="••••••••"
            secureTextEntry={!showConfirm}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              clearError("confirmPassword");
            }}
            onSubmitEditing={() => void handleSubmit()}
            error={errors.confirmPassword}
            right={eyeToggle(showConfirm, () => setShowConfirm((v) => !v))}
          />

          <Button
            label="Reset Password"
            loading={loading}
            onPress={() => void handleSubmit()}
            style={styles.submit}
          />
        </View>

        {/* Resend */}
        <View style={styles.footer}>
          <Text style={[type.headers, styles.footerText]}>{"Didn't get a code?"}</Text>
          <Text
            accessibilityRole="link"
            accessibilityState={{ disabled: !canResend }}
            onPress={canResend ? () => void handleResend() : undefined}
            style={[type.boldText, styles.footerLink, !canResend && styles.footerLinkDisabled]}
          >
            {resending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
          </Text>
        </View>

        <Text accessibilityRole="link" onPress={goBack} style={[type.boldText, styles.back]}>
          Use a different email
        </Text>
      </View>
    </Screen>
  );
};

const useStyles = makeStyles((c) => ({
  header: {
    marginLeft: 19,
    marginRight: 13,
  },
  content: {
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 48,
    color: c.bg,
  },
  subtitle: {
    marginTop: 9,
    fontFamily: fonts.segoe,
    fontSize: 16,
    lineHeight: 24,
    color: c.bg,
    opacity: 0.7,
  },
  form: {
    marginTop: 40,
    gap: 20,
  },
  notice: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: c.powerOn,
  },
  eye: {
    paddingRight: 16,
  },
  submit: {
    marginTop: 8,
  },
  footer: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  footerText: {
    color: c.gray500,
  },
  footerLink: {
    color: c.accent,
  },
  footerLinkDisabled: {
    color: c.gray400,
  },
  back: {
    marginTop: 16,
    textAlign: "center",
    color: c.gray500,
  },
}));

export default ResetPassword;
