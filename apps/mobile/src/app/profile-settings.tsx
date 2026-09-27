import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import BackHeader from "../components/layout/BackHeader";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import { Divider, Row, Section } from "../components/ui/ListSection";
import Button from "../components/ui/Button";
import { FormError } from "../components/ui/StateViews";
import TextField from "../components/ui/TextField";
import { useAuth, useUser } from "../context/AuthContext";
import { ApiError, authApi } from "../services/api";
import { fullName, initials } from "../utils/format";
import { alpha, colors, fonts, type } from "../theme";
import { PASSWORD_HINT, errorMessage, passwordProblem } from "../utils/validation";




const EyeToggle = ({ visible, onToggle }: { visible: boolean; onToggle: () => void }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={visible ? "Hide password" : "Show password"}
    hitSlop={8}
    onPress={onToggle}
    style={styles.eye}
  >
    <Icon name={visible ? "eye" : "eyeSlash"} />
  </Pressable>
);

// Personal information: read-only email + editable full name
const PersonalInfo = () => {
  const user = useUser();
  const { refreshUser } = useAuth();
  const savedName = fullName(user);
  const [name, setName] = useState(savedName);
  const [nameError, setNameError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const trimmed = name.trim().replace(/\s+/g, " ");
  const changed = trimmed !== savedName;

  const handleSave = async () => {
    setFormError(null);
    if (!trimmed) return setNameError("Enter your full name.");
    setNameError(undefined);

    setSaving(true);
    try {
      await authApi.updateProfile({ fullName: trimmed });
      await refreshUser();
      setName(trimmed);
      Alert.alert("Profile updated", "Your name has been saved.");
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors.fullName) setNameError(error.fieldErrors.fullName);
      else setFormError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title="PERSONAL INFORMATION">
      <Row
        icon="envelope"
        iconWidth={20}
        title="Email"
        subtitle={user.email}
        right={
          <View
            style={[
              styles.badge,
              { backgroundColor: alpha(user.emailVerified ? colors.powerOn : colors.muted, 0.1) },
            ]}
          >
            <Text style={[styles.badgeText, { color: user.emailVerified ? colors.powerOn : colors.muted }]}>
              {user.emailVerified ? "Verified" : "Not verified"}
            </Text>
          </View>
        }
      />
      <Divider />
      <View style={styles.form}>
        <FormError message={formError} />
        <TextField
          label="Full Name"
          icon="userOutline"
          labelGap={6}
          placeholder="John Doe"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          maxLength={100}
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (nameError) setNameError(undefined);
          }}
          error={nameError}
        />
        <Button
          label="Save Changes"
          height={48}
          loading={saving}
          disabled={!changed || !trimmed}
          onPress={() => void handleSave()}
        />
      </View>
    </Section>
  );
};

type PasswordField = "currentPassword" | "newPassword" | "confirmNewPassword";

const ChangePassword = () => {
  const { signOut } = useAuth();
  const [values, setValues] = useState<Record<PasswordField, string>>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [visible, setVisible] = useState<Record<PasswordField, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });
  const [errors, setErrors] = useState<Partial<Record<PasswordField, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const setValue = (field: PasswordField) => (text: string) => {
    setValues((prev) => ({ ...prev, [field]: text }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };
  const toggle = (field: PasswordField) => () => setVisible((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleSubmit = async () => {
    setFormError(null);
    const { currentPassword, newPassword, confirmNewPassword } = values;
    const next: Partial<Record<PasswordField, string>> = {};
    if (!currentPassword) next.currentPassword = "Enter your current password.";
    next.newPassword = passwordProblem(newPassword);
    if (!next.newPassword && newPassword === currentPassword) {
      next.newPassword = "Choose a password different from your current one.";
    }
    if (!confirmNewPassword) next.confirmNewPassword = "Confirm your new password.";
    else if (confirmNewPassword !== newPassword) next.confirmNewPassword = "Passwords don't match.";
    setErrors(next);
    if (next.currentPassword || next.newPassword || next.confirmNewPassword) return;

    setSaving(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      // Every session was revoked server-side; the auth guard takes the user back to the start
      Alert.alert("Password changed", "Please log in again with your new password.");
      await signOut();
    } catch (error) {
      if (!(error instanceof ApiError)) {
        setFormError(errorMessage(error));
      } else {
        const { currentPassword: current, newPassword: nextError, confirmNewPassword: confirm } = error.fieldErrors;
        if (current || nextError || confirm) {
          setErrors({ currentPassword: current, newPassword: nextError, confirmNewPassword: confirm });
        } else if (error.status === 400 && /current password/i.test(error.message)) {
          setErrors({ currentPassword: error.message });
        } else {
          setFormError(error.message);
        }
      }
      setSaving(false);
    }
  };

  return (
    <Section title="CHANGE PASSWORD">
      <View style={styles.form}>
        <FormError message={formError} />
        <TextField
          label="Current Password"
          icon="lock"
          labelGap={6}
          placeholder="••••••••"
          secureTextEntry={!visible.currentPassword}
          autoComplete="current-password"
          textContentType="password"
          value={values.currentPassword}
          onChangeText={setValue("currentPassword")}
          error={errors.currentPassword}
          right={<EyeToggle visible={visible.currentPassword} onToggle={toggle("currentPassword")} />}
        />
        <TextField
          label="New Password"
          icon="lock"
          labelGap={6}
          placeholder="••••••••"
          secureTextEntry={!visible.newPassword}
          autoComplete="new-password"
          textContentType="newPassword"
          value={values.newPassword}
          onChangeText={setValue("newPassword")}
          hint={PASSWORD_HINT}
          error={errors.newPassword}
          right={<EyeToggle visible={visible.newPassword} onToggle={toggle("newPassword")} />}
        />
        <TextField
          label="Confirm New Password"
          icon="lock"
          labelGap={6}
          placeholder="••••••••"
          secureTextEntry={!visible.confirmNewPassword}
          autoComplete="new-password"
          textContentType="newPassword"
          value={values.confirmNewPassword}
          onChangeText={setValue("confirmNewPassword")}
          error={errors.confirmNewPassword}
          right={<EyeToggle visible={visible.confirmNewPassword} onToggle={toggle("confirmNewPassword")} />}
        />
        <Button label="Update Password" height={48} loading={saving} onPress={() => void handleSubmit()} />
      </View>
    </Section>
  );
};

const DeleteAccount = () => {
  const { signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await authApi.deleteAccount(password);
      await signOut();
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors.password) {
        setPasswordError(error.fieldErrors.password);
      } else if (error instanceof ApiError && error.status === 400 && /password/i.test(error.message)) {
        setPasswordError(error.message);
      } else {
        setFormError(errorMessage(error));
      }
      setDeleting(false);
    }
  };

  const handlePress = () => {
    setFormError(null);
    if (!password) return setPasswordError("Enter your password to confirm.");
    setPasswordError(undefined);
    Alert.alert(
      "Delete your account?",
      "Your profile will be removed and you'll be signed out everywhere. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => void deleteAccount() },
      ],
    );
  };

  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={[type.boldText, { color: colors.danger }]}>
        DELETE ACCOUNT
      </Text>
      <View style={[styles.form, styles.danger]}>
        <Text style={styles.dangerText}>
          {"Deleting your account signs you out everywhere and removes your profile. This can't be undone."}
        </Text>
        <FormError message={formError} />
        <TextField
          label="Password"
          icon="lock"
          labelGap={6}
          placeholder="••••••••"
          secureTextEntry={!showPassword}
          autoComplete="current-password"
          textContentType="password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) setPasswordError(undefined);
          }}
          error={passwordError}
          right={<EyeToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
        />
        <Button
          label="Delete My Account"
          height={48}
          loading={deleting}
          onPress={handlePress}
          style={styles.deleteButton}
        />
      </View>
    </View>
  );
};

// Profile Settings (no Figma frame; styled like the Profile screen)
const ProfileSettings = () => {
  const user = useUser();

  return (
    <Screen top={23} bottom={40}>
      <BackHeader height={63} />

      <View style={styles.main}>
        {/* Heading */}
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={[type.h1, styles.title]}>
            Profile Settings
          </Text>
          <Text style={styles.subtitle}>Manage your name, password and account.</Text>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no">
            <Text style={styles.avatarText}>{initials(user)}</Text>
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.name} numberOfLines={1}>
              {fullName(user)}
            </Text>
            <Text style={[type.boldText, { color: colors.slate }]} numberOfLines={1}>
              {user.email}
            </Text>
          </View>
        </View>

        <PersonalInfo />
        <ChangePassword />
        <DeleteAccount />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  main: {
    gap: 24,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  heading: {
    gap: 8,
  },
  title: {
    color: colors.bg,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.bg,
    opacity: 0.7,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: alpha(colors.stroke, 0.6),
    borderRadius: 8,
    backgroundColor: colors.white,
    padding: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: colors.avatarBg,
  },
  avatarText: {
    fontFamily: fonts.hankenSemibold,
    fontSize: 20,
    lineHeight: 28,
    color: colors.navy,
  },
  summaryText: {
    flexShrink: 1,
  },
  name: {
    fontFamily: fonts.hankenSemibold,
    fontSize: 20,
    lineHeight: 28,
    color: colors.ink,
  },
  badge: {
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  form: {
    gap: 16,
    padding: 16,
  },
  eye: {
    paddingRight: 16,
  },
  section: {
    gap: 8,
  },
  danger: {
    borderWidth: 1,
    borderColor: alpha(colors.danger, 0.2),
    borderRadius: 8,
    backgroundColor: alpha(colors.dangerTint, 0.1),
  },
  dangerText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.danger,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
});

export default ProfileSettings;
