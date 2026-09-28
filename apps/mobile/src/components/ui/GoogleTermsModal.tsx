import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { FormError } from "./StateViews";
import Button from "./Button";
import { fonts, shadows, type } from "../../theme";
import { makeStyles, useTheme } from "../../theme/ThemeContext";

interface GoogleTermsModalProps {
  visible: boolean;
  loading?: boolean;
  error?: string | null;
  onAgree: () => void;
  onCancel: () => void;
}

/**
 * Shown when POST /auth/google returns 409 TERMS_REQUIRED: the Google account has no
 * PowerWatch account yet, so the person needs to accept the Terms & Conditions and
 * Privacy Policy before one is created, same as the checkbox on the sign-up form.
 */
const GoogleTermsModal = ({ visible, loading = false, error, onAgree, onCancel }: GoogleTermsModalProps) => {
  const { colors } = useTheme();
  const styles = useStyles();
  const [agreed, setAgreed] = useState(false);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text accessibilityRole="header" style={[type.h1, styles.title, { color: colors.bg }]}>
            Create your account
          </Text>
          <Text style={styles.subtitle}>
            {"There's no PowerWatch account for this Google account yet. Agree to the terms below to create one."}
          </Text>

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

          <FormError message={error} style={styles.formError} />

          <View style={styles.actions}>
            <Button
              label="Cancel"
              variant="secondary"
              height={48}
              onPress={onCancel}
              disabled={loading}
              style={styles.cancelButton}
            />
            <Button
              label="Agree & Continue"
              height={48}
              onPress={onAgree}
              disabled={!agreed}
              loading={loading}
              style={styles.agreeButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const useStyles = makeStyles((c) => ({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    backgroundColor: c.card,
    padding: 24,
    boxShadow: shadows.sheet,
  },
  title: {
    fontSize: 20,
    lineHeight: 25,
  },
  subtitle: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: c.gray600,
  },
  terms: {
    marginTop: 20,
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
    paddingTop: 1,
    fontFamily: fonts.segoe,
    fontSize: 14,
    lineHeight: 19,
    color: c.gray500,
  },
  termsLink: {
    color: c.black,
    textDecorationLine: "underline",
  },
  formError: {
    marginTop: 16,
  },
  actions: {
    marginTop: 24,
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  agreeButton: {
    flex: 1,
  },
}));

export default GoogleTermsModal;
