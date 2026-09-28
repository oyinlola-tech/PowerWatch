import { Linking, Modal, ScrollView, Text, View } from "react-native";
import Button from "./Button";
import type { LatestRelease } from "../../services/api";
import { fonts, shadows, type } from "../../theme";
import { makeStyles, useTheme } from "../../theme/ThemeContext";

// The landing page's download section, not the raw APK: the owner wants people to land
// there so they always get the current build and instructions.
const DOWNLOAD_PAGE_URL = "https://powerwatch.oyinlola.site/#download";

interface UpdateModalProps {
  visible: boolean;
  release: LatestRelease | null;
  /** True when the installed build is below `release.minimumVersion` — can't be dismissed. */
  mandatory: boolean;
  onDismiss: () => void;
}

/** Android-only "a new build is out" prompt (see services/appUpdate.ts for when it shows). */
const UpdateModal = ({ visible, release, mandatory, onDismiss }: UpdateModalProps) => {
  const { colors } = useTheme();
  const styles = useStyles();
  if (!release) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!mandatory) onDismiss();
      }}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text accessibilityRole="header" style={[type.h1, styles.title, { color: colors.bg }]}>
            Update available
          </Text>
          <Text style={styles.subtitle}>{`PowerWatch ${release.version} is ready to install.`}</Text>

          {release.notes ? (
            <ScrollView style={styles.notesBox} contentContainerStyle={styles.notesContent}>
              <Text style={styles.notes}>{release.notes}</Text>
            </ScrollView>
          ) : null}

          {mandatory && (
            <Text style={styles.mandatory}>This update is required to keep using PowerWatch.</Text>
          )}

          <View style={styles.actions}>
            {!mandatory && (
              <Button
                label="Later"
                variant="secondary"
                height={48}
                onPress={onDismiss}
                style={styles.laterButton}
              />
            )}
            <Button
              label="Update Now"
              height={48}
              onPress={() => void Linking.openURL(DOWNLOAD_PAGE_URL)}
              style={styles.updateButton}
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
  notesBox: {
    marginTop: 16,
    maxHeight: 160,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 8,
    backgroundColor: c.surfaceNote,
  },
  notesContent: {
    padding: 12,
  },
  notes: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: c.gray600,
  },
  mandatory: {
    marginTop: 16,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: c.danger,
  },
  actions: {
    marginTop: 24,
    flexDirection: "row",
    gap: 12,
  },
  laterButton: {
    flex: 1,
  },
  updateButton: {
    flex: 1,
  },
}));

export default UpdateModal;
