import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import LogoHeader from "../components/layout/LogoHeader";
import Screen from "../components/layout/Screen";
import Icon from "../components/icons/Icon";
import MapView from "../components/map/MapView";
import Button from "../components/ui/Button";
import { FormError } from "../components/ui/StateViews";
import { useAuth } from "../context/AuthContext";
import { ApiError, authApi, locationsApi } from "../services/api";
import type { LocationSearchItem } from "../services/api";
import mixpanel from "../services/mixpanel";
import { goBack } from "../services/navigation";
import { colors, fonts, shadows, type } from "../theme";

// Ilorin, the area shown in the design's map
const ILORIN = { latitude: 8.4799, longitude: 4.5418 };

interface Selection {
  neighborhoodId: number;
  name: string;
  area: string;
  /** Exact GPS point when chosen with "Use current location" */
  gps?: { latitude: number; longitude: number };
}

// Figma "select location" (71:1495)
const SetMonitoringArea = () => {
  // "back" when opened from Home or Profile instead of onboarding;
  // mode "save" adds a saved neighborhood instead of changing the primary one
  const { returnTo, mode } = useLocalSearchParams<{ returnTo?: string; mode?: string }>();
  const isSaveMode = mode === "save";
  const { user, refreshUser } = useAuth();
  const [selection, setSelection] = useState<Selection | null>(() =>
    !isSaveMode && user?.neighborhood
      ? {
          neighborhoodId: user.neighborhood.id,
          name: user.neighborhood.name,
          area: [user.town?.name, user.lga?.name].filter(Boolean).join(", "),
        }
      : null,
  );
  const [results, setResults] = useState<LocationSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [center, setCenter] = useState(ILORIN);
  const [zoom, setZoom] = useState(13);
  // The design's map artwork shows first; the live map takes over once it is used
  const [isLive, setIsLive] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Debounced search; only neighborhoods can be chosen as a monitoring area
  const searchId = useRef(0);
  const term = search.trim();
  const searchActive = term.length >= 2 && term !== selection?.name;
  useEffect(() => {
    if (!searchActive) return;
    const id = ++searchId.current;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const found = await locationsApi.search(term, 20);
        if (id === searchId.current) setResults(found.filter((r) => r.type === "neighborhood" && r.neighborhoodId));
      } catch {
        if (id === searchId.current) setResults([]);
      } finally {
        if (id === searchId.current) setIsSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [term, searchActive]);
  const visibleResults = searchActive ? results : [];
  const searching = searchActive && isSearching;

  const choose = (item: LocationSearchItem) => {
    setSelection({
      neighborhoodId: item.neighborhoodId!,
      name: item.neighborhood ?? item.name,
      area: [item.town, item.lga, item.state].filter(Boolean).join(", "),
    });
    setSearch(item.neighborhood ?? item.name);
    setResults([]);
    setFormError(null);
    if (item.latitude !== null && item.longitude !== null) {
      setIsLive(true);
      setCenter({ latitude: item.latitude, longitude: item.longitude });
      setZoom(13);
    }
  };

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
      const point = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setCenter(point);
      setZoom(15);

      // Resolve the point to a neighborhood
      const place = await locationsApi.reverseGeocode(point.latitude, point.longitude);
      setSelection({
        neighborhoodId: place.neighborhoodId,
        name: place.neighborhood,
        area: [place.town, place.lga, place.state].filter(Boolean).join(", "),
        gps: point,
      });
      setSearch(place.neighborhood);
      setResults([]);
      setFormError(null);
    } catch (error) {
      setLocationError(
        error instanceof ApiError
          ? `We found your position but couldn't match it to a neighborhood. ${error.message}`
          : "Couldn't get your location. Please try again.",
      );
    } finally {
      setIsLocating(false);
    }
  }, []);

  const handleConfirmLocation = async () => {
    if (!selection) {
      setFormError("Search for your neighborhood or use your current location first.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (isSaveMode) {
        await locationsApi.save(selection.neighborhoodId);
      } else {
        await authApi.updateProfile({ neighborhoodId: selection.neighborhoodId, ...(selection.gps ?? {}) });
        await refreshUser();
      }
      mixpanel.track("neighborhood_selected", { neighborhoodId: selection.neighborhoodId, mode: mode ?? "primary" });

      if (returnTo === "back") goBack();
      else router.push("/notifications");
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Couldn't save your location. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen top={65} bottom={24} contentStyle={styles.content}>
      <LogoHeader style={styles.header} />

      {/* Title */}
      <View style={styles.titleBlock}>
        <Text accessibilityRole="header" style={[type.h1, { color: colors.bg }]}>
          {isSaveMode ? "Add a neighborhood" : "Set your monitoring area"}
        </Text>
        <Text style={styles.subtitle}>
          {isSaveMode
            ? "Choose another neighborhood to follow.\nYou'll get its outage alerts too."
            : "Choose the primary neighborhood you want\nto track for outages."}
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
            onChangeText={(text) => {
              setSearch(text);
              // Typing a new search clears the previous choice
              if (selection && text !== selection.name) setSelection(null);
            }}
            onFocus={() => setIsLive(true)}
            placeholder="Search for your neighborhood..."
            placeholderTextColor={colors.gray400}
            accessibilityLabel="Search for your neighborhood"
            returnKeyType="search"
            style={styles.searchInput}
          />
          {searching && <ActivityIndicator size="small" color={colors.gray400} />}
        </View>

        {/* Search results */}
        {visibleResults.length > 0 && (
          <View style={styles.results}>
            {visibleResults.slice(0, 5).map((item) => (
              <Pressable
                key={item.neighborhoodId}
                accessibilityRole="button"
                onPress={() => choose(item)}
                style={({ pressed }) => [styles.result, pressed && { backgroundColor: colors.surface }]}
              >
                <Text style={[type.boldText, { color: colors.ink }]}>{item.neighborhood ?? item.name}</Text>
                <Text style={styles.resultArea} numberOfLines={1}>
                  {[item.town, item.lga, item.state].filter(Boolean).join(", ")}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
        {searchActive && !isSearching && results.length === 0 && (
          <View style={styles.results}>
            <Text style={[styles.resultArea, styles.noResults]}>
              {`No neighborhoods match "${term}". Try your town or LGA name.`}
            </Text>
          </View>
        )}

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

      {/* Chosen neighborhood */}
      {selection && (
        <View style={styles.selected}>
          <Icon name="locationPin" />
          <View style={{ flex: 1 }}>
            <Text style={[type.boldText, { color: colors.ink }]}>{selection.name}</Text>
            {selection.area ? <Text style={styles.resultArea}>{selection.area}</Text> : null}
          </View>
        </View>
      )}

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

      <FormError message={formError} style={styles.formError} />

      <Button
        label={isSaveMode ? "Save Neighborhood" : "Confirm Location"}
        onPress={handleConfirmLocation}
        loading={saving}
        style={styles.confirm}
      />
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
  results: {
    position: "absolute",
    zIndex: 10,
    elevation: 4,
    top: 68,
    left: 16,
    right: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 8,
    backgroundColor: colors.white,
    boxShadow: shadows.card,
  },
  result: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 2,
  },
  resultArea: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.gray500,
  },
  noResults: {
    padding: 16,
  },
  selected: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    backgroundColor: colors.white,
    padding: 15,
  },
  formError: {
    marginTop: 24,
  },
  confirm: {
    marginTop: 44,
  },
});

export default SetMonitoringArea;
