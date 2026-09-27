import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import LogoHeader from "../components/layout/LogoHeader";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import MapView from "../components/map/MapView";
import Button from "../components/ui/Button";
import mixpanel from "../services/mixpanel";
import { goBack } from "../services/navigation";
import { colors, fonts, shadows, type } from "../theme";

// Ilorin, the area shown in the design's map
const ILORIN = { latitude: 8.4799, longitude: 4.5418 };

// Figma "select location" (71:1495)
const SetMonitoringArea = () => {
  // "back" when opened from Home or Profile instead of onboarding
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [search, setSearch] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [center, setCenter] = useState(ILORIN);
  const [zoom, setZoom] = useState(13);
  // The design's map artwork shows first; the live map takes over once it is used
  const [isLive, setIsLive] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const handleGetLocation = useCallback(async () => {
    setIsLive(true);
    setIsLocating(true);
    setLocationError(null);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        setLocationError(
          "Location access denied. Please allow location access in your device settings.",
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCenter({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      setZoom(15);
    } catch {
      setLocationError("Couldn't get your location. Please try again.");
    } finally {
      setIsLocating(false);
    }
  }, []);

  const handleConfirmLocation = () => {
    mixpanel.track("neighborhood_selected", center);

    if (returnTo === "back") goBack();
    else router.push("/notifications");
  };

  return (
    <Screen top={65} bottom={24} contentStyle={styles.content}>
      <LogoHeader style={styles.header} />

      {/* Title */}
      <View style={styles.titleBlock}>
        <Text accessibilityRole="header" style={[type.h1, { color: colors.bg }]}>
          Set your monitoring area
        </Text>
        <Text style={styles.subtitle}>
          {"Choose the primary neighborhood you want\nto track for outages."}
        </Text>
      </View>

      {/* Map */}
      <View style={styles.map}>
        <Pressable
          accessibilityLabel="Map"
          onPress={() => setIsLive(true)}
          style={StyleSheet.absoluteFill}
        >
          <Image
            source={require("../../assets/images/location-map.png")}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        </Pressable>
        {isLive && (
          <View style={[StyleSheet.absoluteFill, { opacity: isMapLoaded ? 1 : 0 }]}>
            <MapView
              latitude={center.latitude}
              longitude={center.longitude}
              zoom={zoom}
              interactive
              onLoad={() => setIsMapLoaded(true)}
            />
          </View>
        )}

        {/* Pin */}
        <View style={styles.pinLayer} pointerEvents="none">
          <View style={styles.pin}>
            <View style={styles.pinDot} />
          </View>
        </View>

        {/* Search */}
        <View style={styles.search}>
          <View style={styles.searchIcon}>
            <Icon name="search" />
          </View>
          <TextInput
            value={search}
            onChangeText={setSearch}
            onFocus={() => setIsLive(true)}
            placeholder="Search for your neighborhood..."
            placeholderTextColor={colors.gray400}
            accessibilityLabel="Search for your neighborhood"
            returnKeyType="search"
            style={styles.searchInput}
          />
        </View>

        {/* Zoom */}
        <View style={styles.zoom}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Zoom in"
            onPress={() => {
              setIsLive(true);
              setZoom((z) => Math.min(z + 1, 19));
            }}
            style={styles.zoomButton}
          >
            <Icon name="plus" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Zoom out"
            onPress={() => {
              setIsLive(true);
              setZoom((z) => Math.max(z - 1, 3));
            }}
            style={styles.zoomButton}
          >
            <Icon name="minus" />
          </Pressable>
        </View>

        {/* Use current location */}
        <Pressable
          accessibilityRole="button"
          onPress={handleGetLocation}
          disabled={isLocating}
          style={[styles.locate, isLocating && { opacity: 0.6 }]}
        >
          <Icon name="locate" />
          <Text style={styles.locateLabel}>
            {isLocating ? "Locating..." : "Use current location"}
          </Text>
        </Pressable>
      </View>

      {locationError && <Text style={styles.error}>{locationError}</Text>}

      {/* Note */}
      <View style={styles.note}>
        <View style={styles.noteIcon}>
          <Icon name="infoSolid" />
        </View>
        <Text style={styles.noteText}>
          {
            "You'll receive notifications specifically for\nthis selected area. You can change this\nlater in settings."
          }
        </Text>
      </View>

      <Button label="Confirm Location" onPress={handleConfirmLocation} style={styles.confirm} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
  },
  header: {
    width: 343,
    maxWidth: "100%",
  },
  titleBlock: {
    marginTop: 44,
    gap: 8,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 17,
    color: colors.bg,
    opacity: 0.7,
  },
  map: {
    marginTop: 44,
    height: 320,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.borderLight,
  },
  pinLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  pin: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: 9999,
    backgroundColor: colors.black,
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    backgroundColor: colors.white,
  },
  search: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    boxShadow: shadows.card,
  },
  searchIcon: {
    paddingRight: 12,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    padding: 0,
    ...type.boldText,
    lineHeight: undefined,
    color: colors.black,
  },
  zoom: {
    position: "absolute",
    left: 16,
    bottom: 16,
    gap: 4,
  },
  zoomButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  locate: {
    position: "absolute",
    right: 16,
    bottom: 16,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    boxShadow: shadows.card,
  },
  locateLabel: {
    fontFamily: fonts.segoe,
    fontSize: 12,
    lineHeight: 16,
    color: colors.black,
  },
  error: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.danger,
  },
  note: {
    marginTop: 44,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    backgroundColor: colors.surface,
    // Figma draws the 1px border inside the 16px padding
    padding: 15,
  },
  noteIcon: {
    paddingTop: 7,
  },
  noteText: {
    flex: 1,
    fontFamily: fonts.segoe,
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray600,
  },
  confirm: {
    marginTop: 44,
  },
});

export default SetMonitoringArea;
