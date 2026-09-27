import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";
import { goBack } from "../services/navigation";
import { colors, fonts, type } from "../theme";

// Figma "Email Confirmation Wireframe" (3:554)
const OtpVerification = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [focused, setFocused] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < 5) inputRefs.current[index + 1]?.focus();
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
        onPress={goBack}
        style={styles.back}
      >
        <Icon name="backArrowBold" />
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
          {"We sent a 6-digit code to your email\naddress. Enter the code below to\nconfirm your account."}
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
                inputMode="numeric"
                textContentType="oneTimeCode"
                maxLength={1}
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

        <Button
          label="Verify Email"
          shadow
          onPress={() => router.push("/how-it-works")}
          style={styles.submit}
        />
      </View>

      {/* Footer logo */}
      <View style={styles.footer}>
        <Logo />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.tintBlue,
    borderRadius: 9999,
    backgroundColor: colors.text,
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
    backgroundColor: colors.tintBlue,
  },
  badgeInner: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: colors.primary,
  },
  title: {
    marginTop: 52,
    textAlign: "center",
    color: colors.bg,
  },
  description: {
    marginTop: 16,
    textAlign: "center",
    color: colors.gray500,
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
    color: colors.black,
  },
  digitActive: {
    backgroundColor: colors.white,
    boxShadow: "0 0 0 2px rgba(0, 0, 0, 0.05)",
  },
  submit: {
    marginTop: 64,
  },
  footer: {
    marginTop: 60,
    alignItems: "center",
  },
});

export default OtpVerification;
