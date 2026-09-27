import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Map, { NavigationControl, Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Search, LocateFixed, Info } from "lucide-react";
import mixpanel from "../Services/mixpanel";

// Try these in order - first one that works
const MAP_STYLES = [
  "https://basemaps.cartodownload.com/gl/positron-gl-style/style.json",
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  "https://tiles.stadiamaps.com/styles/alidade_smooth.json",
];

const SetMonitoringArea = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);
  const [mapStyleIndex, setMapStyleIndex] = useState(0);
  const [mapError, setMapError] = useState(false);

  const [viewState, setViewState] = useState({
    longitude: -122.4194,
    latitude: 37.7749,
    zoom: 12,
  });

  // Try next map style if current fails
  useEffect(() => {
    if (mapError) {
      const nextIndex = (mapStyleIndex + 1) % MAP_STYLES.length;
      setMapStyleIndex(nextIndex);
      setMapError(false);
    }
  }, [mapError, mapStyleIndex]);

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation isn't supported by your browser.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setViewState((prev) => ({ ...prev, latitude, longitude, zoom: 15 }));
        setMarker({ latitude, longitude });
        setIsLocating(false);
        setIsLocationConfirmed(true);
        setLocationError(null);
      },
      (error) => {
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Location access denied. Please allow location access in your browser settings."
            : "Couldn't get your location. Please try again."
        );
        setIsLocating(false);
        setIsLocationConfirmed(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleConfirmLocation = useCallback(() => {
    if (!marker) {
      handleGetLocation();
      return;
    }
    
    mixpanel.track("neighborhood_selected", {
    latitude: marker.latitude,
    longitude: marker.longitude,
  });

    navigate("/notifications");
  }, [marker, handleGetLocation, navigate]);

  return (
    <main className="flex min-h-screen flex-col bg-white px-6 py-8">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2 border-b border-gray-200 pb-3">
          <img src="/icon.svg" alt="PowerWatch" className="h-7 w-7 rounded-md" />
          <h1 className="text-xl font-semibold text-slate-700">
            <span className="font-bold">Power</span>Watch
          </h1>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-slate-900">
          Set your monitoring area
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Choose the primary neighborhood you want to track for outages.
        </p>

        {/* Map */}
        <div className="relative mt-6 h-80 w-full overflow-hidden rounded-2xl border border-gray-200">
          <Map
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapStyle={MAP_STYLES[mapStyleIndex]}
            style={{ 
              width: "100%", 
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0
            }}
            onError={() => setMapError(true)}
          >
            {marker && (
              <Marker latitude={marker.latitude} longitude={marker.longitude}>
                <div className="h-4 w-4 rounded-full border-4 border-white bg-[#0663EA] shadow-lg" />
              </Marker>
            )}
            <NavigationControl showCompass={false} position="bottom-left" />
          </Map>

          {/* Search bar overlay */}
          <div className="absolute left-3 right-3 top-3 z-10 flex h-11 items-center rounded-xl bg-white px-3 shadow-md">
            <Search size={16} className="mr-2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for your neighborhood..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Use current location */}
          <button
            onClick={handleGetLocation}
            disabled={isLocating}
            className="absolute bottom-3 right-3 z-10 flex h-9 items-center gap-2 rounded-full bg-white px-3 text-xs font-medium text-slate-700 shadow-md transition hover:bg-gray-50 disabled:opacity-60"
          >
            <LocateFixed size={14} />
            {isLocating ? "Locating..." : "Use current location"}
          </button>
        </div>

        {locationError && (
          <p className="mt-2 text-xs text-red-500">{locationError}</p>
        )}

        {isLocationConfirmed && (
          <p className="mt-2 text-xs text-green-600">
            ✅ Location confirmed! You're ready to proceed.
          </p>
        )}

        {/* Info note */}
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-gray-50 p-3">
          <Info size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
          <p className="text-xs leading-5 text-gray-500">
            You'll receive notifications specifically for this selected area.
            You can change this later in settings.
          </p>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirmLocation}
          className="mt-auto h-14 w-full rounded-full bg-[#0663EA] text-lg font-semibold text-white transition hover:bg-blue-700"
        >
          {isLocating ? "Getting location..." : isLocationConfirmed ? "Confirm Location ✓" : "Confirm Location"}
        </button>
      </div>
    </main>
  );
};

export default SetMonitoringArea;