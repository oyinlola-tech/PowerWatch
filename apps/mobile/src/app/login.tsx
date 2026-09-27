import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import LogoHeader from "../components/layout/LogoHeader";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import Button from "../components/ui/Button";
import SocialButtons from "../components/ui/SocialButtons";
import TextField from "../components/ui/TextField";
import { colors, fonts, type } from "../theme";

// Figma "Login Screen Wireframe" (3:398)
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Screen top={37} bottom={40}>
      <LogoHeader style={styles.header} />

      <View style={styles.content}>
        {/* Heading */}
        <Text accessibilityRole="header" style={[type.h1, styles.title]}>
          Welcome Back
        </Text>
        <Text style={styles.subtitle}>
          Please enter your details to sign in to your PowerWatch account.
        </Text>

        {/* Form */}
        <TextField
          label="Email"
          icon="envelope"
          borderColor={colors.primary}
          placeholder="name@example.com"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          containerStyle={styles.email}
        />

        <TextField
          label="Password"
          icon="lock"
          borderColor={colors.primary}
          placeholder="••••••••"
          secureTextEntry={!showPassword}
          autoComplete="current-password"
          textContentType="password"
          containerStyle={styles.password}
          labelRight={
            <Pressable accessibilityRole="button" hitSlop={8}>
              <Text style={[type.lightText, styles.forgot]}>Forgot Password?</Text>
            </Pressable>
          }
          right={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              hitSlop={8}
              onPress={() => setShowPassword((v) => !v)}
              style={styles.eye}
            >
              <Icon name={showPassword ? "eye" : "eyeSlash"} />
            </Pressable>
          }
        />

        <Button label="Login" onPress={() => router.push("/verify")} style={styles.submit} />

        <SocialButtons dividerLabel="Or continue with" dividerPadding={40} />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[type.headers, styles.footerText]}>{"Don't have an account?"}</Text>
          <Text
            accessibilityRole="link"
            onPress={() => router.push("/register")}
            style={[type.boldText, styles.footerLink]}
          >
            Sign Up
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
  email: {
    marginTop: 64,
  },
  password: {
    marginTop: 20,
  },
  forgot: {
    color: colors.black,
  },
  eye: {
    paddingRight: 16,
  },
  submit: {
    marginTop: 28,
  },
  footer: {
    marginTop: 99,
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  footerText: {
    width: 171.52,
    textAlign: "center",
    color: colors.gray500,
  },
  footerLink: {
    width: 60.47,
    textAlign: "center",
    color: colors.primary,
  },
});

export default Login;
