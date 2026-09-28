import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import AppHeader from "../components/layout/AppHeader";
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
import { fonts, shadows, type } from "../theme";
import { makeStyles, useTheme } from "../theme/ThemeContext";

// Ilorin, the area shown in the design's map
const ILORIN = { latitude: 8.4799, longitude: 4.5418 };

type Point = { latitude: number; longitude: number };

interface Selection {
  /** Unknown for a pin the user dropped; resolved on confirm */
  neighborhoodId?: number;
  name: string;
  area: string;
  /** Exact point to save: the GPS fix or where the user placed the pin */
  point?: Point;
  source: "saved" | "gps" | "search" | "pin";
}

const describePoint = (p: Point) => `${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}`;

// Figma "select location" (71:1495)
const SetMonitoringArea = () => {
  const { colors } = useTheme();
  const styles = useStyles();
  // "back" when opened from Home or Profile instead of onboarding;
  // mode "save" adds a saved neighborhood instead of changing the primary one
  const { returnTo, mode } = useLocalSearchParams<{ returnTo?: string; mode?: string }>();
  const isSaveMode = mode === "save";
  const { user, refreshUser } = useAuth();
  const savedPoint =
    !isSaveMode && user?.latitude != null && user?.longitude != null
      ? { latitude: user.latitude, longitude: user.longitude }
      : null;
  const [selection, setSelection] = useState<Selection | null>(() =>
    !isSaveMode && user?.neighborhood
      ? {
          neighborhoodId: user.neighborhood.id,
          name: user.neighborhood.name,
          area: [user.town?.name, user.lga?.name].filter(Boolean).join(", "),
          ...(savedPoint ? { point: savedPoint } : {}),
          source: "saved",
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
  const [center, setCenter] = useState<Point>(savedPoint ?? ILORIN);
  const [zoom, setZoom] = useState(savedPoint ? 16 : 13);
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
      source: "search",
    });
    setSearch(item.neighborhood ?? item.name);
    setResults([]);
    setFormError(null);
    if (item.latitude !== null && item.longitude !== null) {
      setIsLive(true);
      setCenter({ latitude: item.latitude, longitude: item.longitude });
      setZoom(14);
    }
  };

  /** Ask for permission, centre on the phone's exact position and find its neighborhood. */
  const locate = useCallback(async (silentIfDenied: boolean) => {
    setIsLive(true);
    setIsLocating(true);
    setLocationError(null);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        if (!silentIfDenied) {
          setLocationError(
            "Location access is off. Allow it in your phone's settings, or search and drag the map to place the pin yourself.",
          );
        }
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const point = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setCenter(point);
      setZoom(17);

      const place = await locationsApi.reverseGeocode(point.latitude, point.longitude);
      setSelection({
        neighborhoodId: place.neighborhoodId,
        name: place.neighborhood,
        area: [place.town, place.lga, place.state].filter(Boolean).join(", "),
        point,
        source: "gps",
      });
      setSearch(place.neighborhood);
      setResults([]);
      setFormError(null);
    } catch (error) {
      setLocationError(
        error instanceof ApiError
          ? `We found your position but couldn't match it to a neighborhood. ${error.message}`
          : "Couldn't get your location. Check that location services are on and try again.",
      );
    } finally {
      setIsLocating(false);
    }
  }, []);

  // Setting the primary area: ask for location straight away so the pin starts on the user
  const askedOnOpen = useRef(false);
  useEffect(() => {
    if (isSaveMode || askedOnOpen.current || selection?.source === "saved") return;
    askedOnOpen.current = true;
    const timer = setTimeout(() => void locate(true), 0);
    return () => clearTimeout(timer);
  }, [isSaveMode, locate, selection?.source]);

  // Dragging the map moves the pin (always at the centre) to an exact spot
  const handleMapMove = useCallback((view: Point & { byUser: boolean }) => {
    if (!view.byUser) return;
    const point = { latitude: view.latitude, longitude: view.longitude };
    setSelection({
      name: "Pinned location",
      area: describePoint(point),
      point,
      source: "pin",
    });
    setSearch("");
    setResults([]);
    setFormError(null);
  }, []);

  const handleConfirmLocation = async () => {
    if (!selection) {
      setFormError("Use your current location, search for your neighborhood, or drag the map to place the pin.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      let neighborhoodId = selection.neighborhoodId;
      if (neighborhoodId === undefined && selection.point) {
        // A dropped pin: find which neighborhood that exact point is in
        const place = await locationsApi.reverseGeocode(selection.point.latitude, selection.point.longitude);
        neighborhoodId = place.neighborhoodId;
      }
      if (neighborhoodId === undefined) throw new Error("No neighborhood");

      if (isSaveMode) {
        await locationsApi.save(neighborhoodId);
      } else {
        await authApi.updateProfile({ neighborhoodId, ...(selection.point ?? {}) });
        await refreshUser();
      }
      // Which neighborhood was chosen is personal, so it is not sent to analytics
      mixpanel.track("neighborhood_selected", {
        mode: mode ?? "primary",
        source: selection.source,
        exact: Boolean(selection.point),
      });

      if (returnTo === "back") goBack();
      else router.push("/notifications");
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Couldn't save your location. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen header={<AppHeader back={returnTo === "back"} />}>
      {/* Title */}
      <View style={styles.titleBlock}>
        <Text accessibilityRole="header" style={[type.h1, { color: colors.bg }]}>
          {isSaveMode ? "Add a neighborhood" : "Set your monitoring area"}
        </Text>
        <Text style={styles.subtitle}>
          {isSaveMode
            ? "Choose another neighborhood to follow. You'll get its outage alerts too."
            : "Choose the primary neighborhood you want to track for outages."}
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
              onMove={handleMapMove}
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
            <Icon name="search" color={colors.gray400} />
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
            <Icon name="plus" color={colors.gray600} />
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
            <Icon name="minus" color={colors.gray600} />
          </Pressable>
        </View>

        {/* Use current location */}
        <Pressable
          accessibilityRole="button"
          onPress={() => void locate(false)}
          disabled={isLocating}
          style={[styles.locate, isLocating && { opacity: 0.6 }]}
        >
          <Icon name="locate" color={colors.black} />
          <Text style={styles.locateLabel}>
            {isLocating ? "Locating..." : "Use current location"}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.pinHint}>
        {isLocating
          ? "Finding your exact location…"
          : "Drag the map to put the pin exactly on your home or street."}
      </Text>

      {locationError && <Text style={styles.error}>{locationError}</Text>}

      {/* Chosen place */}
      {selection && (
        <View style={styles.selected}>
          <Icon name="locationPin" color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[type.boldText, { color: colors.ink }]}>{selection.name}</Text>
            {selection.area ? <Text style={styles.resultArea}>{selection.area}</Text> : null}
            {selection.point && selection.source !== "pin" ? (
              <Text style={styles.resultArea}>Exact point: {describePoint(selection.point)}</Text>
            ) : null}
            {selection.source === "pin" ? (
              <Text style={styles.resultArea}>We&apos;ll match this spot to its neighborhood when you confirm.</Text>
            ) : null}
          </View>
        </View>
      )}

      {/* Note */}
      <View style={styles.note}>
        <View style={styles.noteIcon}>
          <Icon name="infoSolid" color={colors.gray400} />
        </View>
        <Text style={styles.noteText}>
          {
            "You'll receive notifications specifically for this selected area. You can change this later in settings."
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

const useStyles = makeStyles((c) => ({
  titleBlock: {
    marginTop: 8,
    gap: 8,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: c.bg,
    opacity: 0.7,
  },
  map: {
    marginTop: 24,
    height: 320,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    backgroundColor: c.borderLight,
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
    // The map pin is drawn over map tiles and keeps its colours in both themes
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 9999,
    backgroundColor: "#000000",
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    backgroundColor: "#FFFFFF",
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
    borderColor: c.borderInput,
    borderRadius: 8,
    backgroundColor: c.card,
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
    color: c.black,
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
    borderColor: c.borderInput,
    borderRadius: 4,
    backgroundColor: c.card,
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
    borderColor: c.borderInput,
    borderRadius: 8,
    backgroundColor: c.card,
    paddingHorizontal: 16,
    boxShadow: shadows.card,
  },
  locateLabel: {
    fontFamily: fonts.segoe,
    fontSize: 12,
    lineHeight: 16,
    color: c.black,
  },
  pinHint: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: c.gray500,
  },
  error: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: c.danger,
  },
  note: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 8,
    backgroundColor: c.surface,
    // Figma draws the 1px border inside the 16px padding
    padding: 15,
  },
  noteIcon: {
    paddingTop: 2,
  },
  noteText: {
    flex: 1,
    fontFamily: fonts.segoe,
    fontSize: 14,
    lineHeight: 20,
    color: c.gray600,
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
    borderColor: c.borderInput,
    borderRadius: 8,
    backgroundColor: c.card,
    boxShadow: shadows.card,
  },
  result: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
    gap: 2,
  },
  resultArea: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: c.gray500,
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
    borderColor: c.primary,
    borderRadius: 8,
    backgroundColor: c.card,
    padding: 15,
  },
  formError: {
    marginTop: 24,
  },
  confirm: {
    marginTop: 24,
  },
}));

export default SetMonitoringArea;
