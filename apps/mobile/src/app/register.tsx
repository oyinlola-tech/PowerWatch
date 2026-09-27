import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import LogoHeader from "../components/layout/LogoHeader";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import Button from "../components/ui/Button";
import SocialButtons from "../components/ui/SocialButtons";
import TextField from "../components/ui/TextField";
import mixpanel from "../services/mixpanel";
import { notAvailableYet } from "../services/navigation";
import { colors, fonts, type } from "../theme";

// Figma "Signup Screen Wireframe" (3:467)
const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSignUp = () => {
    mixpanel.track("sign_up_completed");
    router.push("/verify");
  };

  return (
    <Screen top={37} bottom={40}>
      <LogoHeader style={styles.header} />

      <View style={styles.content}>
        {/* Heading */}
        <Text accessibilityRole="header" style={[type.h1, styles.title]}>
          Create Account
        </Text>
        <Text style={styles.subtitle}>
          Join PowerWatch to start monitoring your energy efficiency.
        </Text>

        {/* Form */}
        <View style={styles.form}>
          <TextField
            label="Full Name"
            icon="userOutline"
            labelGap={6}
            placeholder="John Doe"
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
          />

          <TextField
            label="Email Address"
            icon="envelope"
            labelGap={6}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
          />

          <TextField
            label="Password"
            icon="lock"
            labelGap={6}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            textContentType="newPassword"
            hint="Must be at least 8 characters with one number."
            right={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                hitSlop={8}
                onPress={() => setShowPassword((v) => !v)}
                style={styles.eye}
              >
                <Icon name={showPassword ? "eyeSlash" : "eye"} />
              </Pressable>
            }
          />

          {/* Terms */}
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreed }}
            onPress={() => setAgreed((v) => !v)}
            style={styles.terms}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && <View style={styles.checkmark} />}
            </View>
            <Text style={styles.termsText}>
              I agree to the{" "}
              <Text
                accessibilityRole="link"
                onPress={() => notAvailableYet("Terms & Conditions")}
                style={styles.termsLink}
              >
                {"Terms & Conditions"}
              </Text>{" "}
              and{" "}
              <Text
                accessibilityRole="link"
                onPress={() => notAvailableYet("Privacy Policy")}
                style={styles.termsLink}
              >
                Privacy Policy
              </Text>
            </Text>
          </Pressable>

          <Button label="Sign Up" shadow onPress={handleSignUp} style={styles.submit} />
        </View>

        <View style={styles.social}>
          <SocialButtons
            dividerLabel="Or sign up with"
            dividerFont={fonts.segoe}
            dividerPadding={32}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.gray500 }]}>
            Already have an account?
          </Text>
          <Text
            accessibilityRole="link"
            onPress={() => router.push("/login")}
            style={[styles.footerText, { color: colors.black }]}
          >
            Login
          </Text>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    marginLeft: 24,
    marginRight: 8,
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
    fontSize: 15.75,
    lineHeight: 24,
    color: colors.bg,
    opacity: 0.7,
  },
  form: {
    marginTop: 40,
    gap: 16,
  },
  eye: {
    paddingRight: 16,
  },
  terms: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.checkboxBorder,
    borderRadius: 2.5,
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkmark: {
    width: 10,
    height: 6,
    marginTop: -2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.white,
    transform: [{ rotate: "-45deg" }],
  },
  termsText: {
    flex: 1,
    maxWidth: 245.05,
    paddingTop: 1,
    fontFamily: fonts.segoe,
    fontSize: 14,
    lineHeight: 19,
    color: colors.gray500,
  },
  termsLink: {
    color: colors.black,
    textDecorationLine: "underline",
  },
  submit: {
    marginTop: 16,
  },
  social: {
    marginTop: 10,
  },
  footer: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  footerText: {
    fontFamily: fonts.segoe,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
});

export default Register;
