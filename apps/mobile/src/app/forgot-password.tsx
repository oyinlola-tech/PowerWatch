import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import LogoHeader from "../components/layout/LogoHeader";
import Screen from "../components/layout/Screen";
import Button from "../components/ui/Button";
import { FormError } from "../components/ui/StateViews";
import TextField from "../components/ui/TextField";
import { ApiError, authApi } from "../services/api";
import { goBack } from "../services/navigation";
import { colors, fonts, type } from "../theme";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Forgot Password (no Figma frame; styled like the Login screen)
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const value = email.trim().toLowerCase();
    setFormError(null);
    if (!value) return setEmailError("Enter your email address.");
    if (!EMAIL_PATTERN.test(value)) return setEmailError("Enter a valid email address.");
    setEmailError(undefined);

    setLoading(true);
    try {
      await authApi.forgotPassword(value);
      router.push({ pathname: "/reset-password", params: { email: value } });
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors.email) {
        setEmailError(error.fieldErrors.email);
      } else {
        setFormError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen top={37} bottom={40}>
      <LogoHeader style={styles.header} />

      <View style={styles.content}>
        {/* Heading */}
        <Text accessibilityRole="header" style={[type.h1, styles.title]}>
          Forgot Password
        </Text>
        <Text style={styles.subtitle}>
          {"Enter the email you signed up with and we'll send you a 6-digit reset code."}
        </Text>

        {/* Form */}
        <View style={styles.form}>
          <FormError message={formError} />

          <TextField
            label="Email"
            icon="envelope"
            borderColor={colors.primary}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="send"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError(undefined);
            }}
            onSubmitEditing={() => void handleSubmit()}
            error={emailError}
          />

          <Button
            label="Send Reset Code"
            loading={loading}
            onPress={() => void handleSubmit()}
            style={styles.submit}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[type.headers, styles.footerText]}>Remembered it?</Text>
          <Text accessibilityRole="link" onPress={goBack} style={[type.boldText, styles.footerLink]}>
            Back to Login
          </Text>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    marginLeft: 19,
    marginRight: 13,
  },
  content: {
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 48,
    color: colors.bg,
  },
  subtitle: {
    marginTop: 9,
    fontFamily: fonts.segoe,
    fontSize: 16,
    lineHeight: 24,
    color: colors.bg,
    opacity: 0.7,
  },
  form: {
    marginTop: 48,
    gap: 20,
  },
  submit: {
    marginTop: 8,
  },
  footer: {
    marginTop: 64,
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  footerText: {
    color: colors.gray500,
  },
  footerLink: {
    color: colors.primary,
  },
});

export default ForgotPassword;
