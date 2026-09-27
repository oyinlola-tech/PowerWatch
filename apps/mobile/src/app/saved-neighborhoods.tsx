import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import BackHeader from "../components/layout/BackHeader";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import { Divider, Section } from "../components/ui/ListSection";
import Button from "../components/ui/Button";
import { EmptyView, ErrorView, LoadingView } from "../components/ui/StateViews";
import { useApi } from "../hooks/useApi";
import { locationsApi } from "../services/api";
import type { SavedNeighborhood } from "../services/api";
import { addSavedNeighborhood } from "../services/navigation";
import { timeAgo } from "../utils/format";
import { alpha, fonts, type } from "../theme";
import { makeStyles, useTheme } from "../theme/ThemeContext";
import { errorMessage } from "../utils/validation";

const MAX_SAVED = 10;


const StatusPill = ({ place }: { place: SavedNeighborhood }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  let label: string;
  let color: string;
  if (place.status === "ON") {
    label = "Power ON";
    color = colors.powerOn;
  } else if (place.status === "OFF") {
    const ago = timeAgo(place.outageSince);
    label = place.outageSince ? `Out ${ago === "Just now" ? "just now" : ago}` : "Power OFF";
    color = colors.powerOff;
  } else {
    label = "No reports yet";
    color = colors.muted;
  }

  return (
    <View style={[styles.pill, { backgroundColor: alpha(color, 0.1) }]}>
      <Text style={[styles.pillText, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

interface PlaceRowProps {
  place: SavedNeighborhood;
  removing: boolean;
  onRemove: () => void;
}

const PlaceRow = ({ place, removing, onRemove }: PlaceRowProps) => {
  const { colors } = useTheme();
  const styles = useStyles();

  return (
    <View style={[styles.row, removing && styles.rowBusy]}>
      <View style={styles.rowText}>
        <Text style={[type.boldText, { color: colors.ink }]}>
          {place.label ? `${place.name} · ${place.label}` : place.name}
        </Text>
        <Text style={styles.town}>{place.town}</Text>
      </View>
      <StatusPill place={place} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove ${place.name}`}
        accessibilityState={{ disabled: removing, busy: removing }}
        disabled={removing}
        hitSlop={6}
        onPress={onRemove}
        style={({ pressed }) => [styles.remove, pressed && { opacity: 0.7 }]}
      >
        <Icon name="minus" color={colors.gray600} />
      </Pressable>
    </View>
  );
};

// Saved Neighborhoods (no Figma frame; styled like the Profile screen)
const SavedNeighborhoods = () => {
  const styles = useStyles();
  const { data, error, loading, refreshing, refresh, mutate } = useApi(locationsApi.saved);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const count = data?.length ?? 0;
  const atLimit = count >= MAX_SAVED;

  const remove = async (place: SavedNeighborhood) => {
    setRemovingId(place.neighborhoodId);
    try {
      await locationsApi.unsave(place.neighborhoodId);
      mutate((current) => current?.filter((p) => p.neighborhoodId !== place.neighborhoodId));
    } catch (err) {
      Alert.alert("Couldn't remove neighborhood", errorMessage(err));
    } finally {
      setRemovingId(null);
    }
  };

  const confirmRemove = (place: SavedNeighborhood) =>
    Alert.alert(`Remove ${place.name}?`, "You'll stop getting outage and restoration alerts for it.", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => void remove(place) },
    ]);

  const renderBody = () => {
    if (loading) return <LoadingView label="Loading saved neighborhoods" />;
    if (error && !data) return <ErrorView message={error.message} onRetry={() => void refresh()} />;
    if (!data || data.length === 0) {
      return (
        <EmptyView
          icon="mapOutline"
          title="No saved neighborhoods"
          message="Add a neighborhood to get alerts when its power goes out or comes back."
        />
      );
    }

    return (
      <Section title={`SAVED (${count}/${MAX_SAVED})`}>
        {data.map((place, index) => (
          <View key={place.neighborhoodId}>
            {index > 0 && <Divider />}
            <PlaceRow
              place={place}
              removing={removingId === place.neighborhoodId}
              onRemove={() => confirmRemove(place)}
            />
          </View>
        ))}
      </Section>
    );
  };

  return (
    <Screen top={23} bottom={40} onRefresh={() => void refresh()} refreshing={refreshing}>
      <BackHeader height={63} />

      <View style={styles.main}>
        {/* Heading */}
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={[type.h1, styles.title]}>
            Saved Neighborhoods
          </Text>
          <Text style={styles.subtitle}>
            Get outage and restoration alerts for places you care about, like work or family. You can save up
            to 10.
          </Text>
        </View>

        <View style={styles.add}>
          <Button
            label="Add Neighborhood"
            onPress={addSavedNeighborhood}
            disabled={loading || atLimit}
          />
          {atLimit && (
            <Text style={styles.limit}>
              {"You've saved the maximum of 10 neighborhoods. Remove one to add another."}
            </Text>
          )}
        </View>

        {renderBody()}
      </View>
    </Screen>
  );
};

const useStyles = makeStyles((c) => ({
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
    color: c.bg,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: c.bg,
    opacity: 0.7,
  },
  add: {
    gap: 8,
  },
  limit: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
    color: c.muted,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  rowBusy: {
    opacity: 0.5,
  },
  rowText: {
    flex: 1,
  },
  town: {
    fontFamily: fonts.hankenMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    color: c.slate,
  },
  pill: {
    flexShrink: 0,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  remove: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: c.borderInput,
    borderRadius: 4,
    backgroundColor: c.card,
  },
}));

export default SavedNeighborhoods;
