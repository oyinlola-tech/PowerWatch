import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import LogoHeader from "../components/layout/LogoHeader";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import Button from "../components/ui/Button";
import SocialButtons from "../components/ui/SocialButtons";
import TextField from "../components/ui/TextField";
import { FormError } from "../components/ui/StateViews";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../services/api";
import mixpanel from "../services/mixpanel";
import { fonts, type } from "../theme";
import { makeStyles, useTheme } from "../theme/ThemeContext";
import { PASSWORD_HINT, isValidEmail, passwordProblem } from "../utils/validation";

// Figma "Signup Screen Wireframe" (3:467)

type Field = "fullName" | "email" | "password" | "terms" | "form";

const Register = () => {
  const { signUp } = useAuth();
  const { colors } = useTheme();
  const styles = useStyles();
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  // Editing a field clears its error
  const edit = (field: Field, setter: (value: string) => void) => (value: string) => {
    setter(value);
    setErrors((e) => ({ ...e, [field]: undefined, form: undefined }));
  };

  const handleSignUp = async () => {
    const next: Partial<Record<Field, string>> = {};
    if (!fullName.trim()) next.fullName = "Enter your full name.";
    if (!isValidEmail(email)) next.email = "Enter a valid email address.";
    const passwordIssue = passwordProblem(password);
    if (passwordIssue) next.password = passwordIssue;
    if (!agreed) next.terms = "Please agree to the Terms & Conditions and Privacy Policy.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      // On success the auth guard leaves this screen; the splash sends the user to verify
      await signUp(fullName.trim(), email.trim(), password);
      mixpanel.track("sign_up_completed");
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setErrors({
        fullName: apiError?.fieldErrors.fullName,
        email: apiError?.fieldErrors.email,
        password: apiError?.fieldErrors.password,
        form: apiError?.message ?? "Couldn't create your account. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
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
            value={fullName}
            onChangeText={edit("fullName", setFullName)}
            error={errors.fullName}
          />

          <TextField
            label="Email Address"
            icon="envelope"
            labelGap={6}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            value={email}
            onChangeText={edit("email", setEmail)}
            error={errors.email}
          />

          <TextField
            label="Password"
            icon="lock"
            labelGap={6}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            textContentType="newPassword"
            hint={PASSWORD_HINT}
            value={password}
            onChangeText={edit("password", setPassword)}
            error={errors.password}
            right={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                hitSlop={8}
                onPress={() => setShowPassword((v) => !v)}
                style={styles.eye}
              >
                <Icon name={showPassword ? "eyeSlash" : "eye"} color={colors.gray400} />
              </Pressable>
            }
          />

          {/* Terms */}
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreed }}
            onPress={() => {
              setAgreed((v) => !v);
              setErrors((e) => ({ ...e, terms: undefined }));
            }}
            style={styles.terms}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && <View style={styles.checkmark} />}
            </View>
            <Text style={styles.termsText}>
              I agree to the{" "}
              <Text
                accessibilityRole="link"
                onPress={() => router.push("/terms")}
                style={styles.termsLink}
              >
                {"Terms & Conditions"}
              </Text>{" "}
              and{" "}
              <Text
                accessibilityRole="link"
                onPress={() => router.push("/privacy")}
                style={styles.termsLink}
              >
                Privacy Policy
              </Text>
            </Text>
          </Pressable>

          {errors.terms && <Text style={styles.termsError}>{errors.terms}</Text>}
          <FormError message={errors.form} />

          <Button label="Sign Up" shadow onPress={handleSignUp} loading={submitting} style={styles.submit} />
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

const useStyles = makeStyles((c) => ({
  header: {
    marginLeft: 24,
    marginRight: 8,
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
    fontSize: 15.75,
    lineHeight: 24,
    color: c.bg,
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
    borderColor: c.checkboxBorder,
    borderRadius: 2.5,
    backgroundColor: c.card,
  },
  checkboxChecked: {
    borderColor: c.primary,
    backgroundColor: c.primary,
  },
  checkmark: {
    width: 10,
    height: 6,
    marginTop: -2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: c.white,
    transform: [{ rotate: "-45deg" }],
  },
  termsText: {
    flex: 1,
    maxWidth: 245.05,
    paddingTop: 1,
    fontFamily: fonts.segoe,
    fontSize: 14,
    lineHeight: 19,
    color: c.gray500,
  },
  termsError: {
    marginTop: -8,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: c.danger,
  },
  termsLink: {
    color: c.black,
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
}));

export default Register;
