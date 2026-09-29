import { useEffect, useMemo, useRef, useState } from "react";
import { buildMapHtml, parseMapMessage } from "./mapHtml";
import type { HomeLocation, MapFocus, MapMarker, MapOptions, UserLocation } from "./mapHtml";
import { useTheme } from "../../theme/ThemeContext";

export type MapViewProps = MapOptions;

interface MapWindow extends Window {
  powerwatchMap?: {
    setView: (view: { latitude: number; longitude: number; zoom: number }) => void;
    setMarkers: (markers: MapMarker[], fit: boolean) => void;
    setUserLocation: (user: UserLocation | null) => void;
    setHomeLocation: (home: HomeLocation | null) => void;
    flyTo: (view: MapFocus) => void;
  };
}

// Browser preview of the native MapView (used with `expo start --web`)
const MapView = (props: MapViewProps) => {
  const { latitude, longitude, zoom, onLoad, markers, fitToMarkers = false, onMarkerPress, onMove, userLocation, homeLocation, focus } = props;
  const frame = useRef<HTMLIFrameElement>(null);
  const { isDark } = useTheme();
  // A blob URL gives the document this page's origin, which MapLibre's worker needs.
  // It is rebuilt only when the theme changes; later prop changes go into the live map.
  const src = useMemo(
    () => URL.createObjectURL(new Blob([buildMapHtml({ ...props, dark: isDark })], { type: "text/html" })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDark],
  );
  // Readiness belongs to one document, so a theme switch waits for the new map
  const [readySrc, setReadySrc] = useState<string | null>(null);
  const isReady = readySrc === src;

  useEffect(() => () => URL.revokeObjectURL(src), [src]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      const data = String(event.data);
      if (data.includes('"ready"')) setReadySrc(src);
      if (data.includes('"loaded"')) onLoad?.();
      const message = parseMapMessage(data);
      if (message?.type === "marker" && message.id) onMarkerPress?.(String(message.id));
      if (message?.type === "move" && message.latitude !== undefined && message.longitude !== undefined) {
        onMove?.({
          latitude: message.latitude,
          longitude: message.longitude,
          zoom: message.zoom ?? 0,
          byUser: Boolean(message.byUser),
        });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onLoad, onMarkerPress, onMove, src]);

  // The "ready" message can fire before the listener above is attached, so also
  // poll for the map API until it appears.
  useEffect(() => {
    if (isReady) return;
    const timer = setInterval(() => {
      if ((frame.current?.contentWindow as MapWindow | null)?.powerwatchMap) setReadySrc(src);
    }, 250);
    return () => clearInterval(timer);
  }, [isReady, src]);

  useEffect(() => {
    if (!isReady) return;
    const map = (frame.current?.contentWindow as MapWindow | null)?.powerwatchMap;
    map?.setView({ latitude, longitude, zoom });
  }, [isReady, latitude, longitude, zoom]);

  useEffect(() => {
    if (!isReady || !markers) return;
    (frame.current?.contentWindow as MapWindow | null)?.powerwatchMap?.setMarkers(markers, fitToMarkers);
  }, [isReady, markers, fitToMarkers]);

  useEffect(() => {
    if (!isReady) return;
    (frame.current?.contentWindow as MapWindow | null)?.powerwatchMap?.setUserLocation(userLocation ?? null);
  }, [isReady, userLocation]);

  useEffect(() => {
    if (!isReady) return;
    (frame.current?.contentWindow as MapWindow | null)?.powerwatchMap?.setHomeLocation(homeLocation ?? null);
  }, [isReady, homeLocation]);

  useEffect(() => {
    if (!isReady || !focus) return;
    (frame.current?.contentWindow as MapWindow | null)?.powerwatchMap?.flyTo(focus);
  }, [isReady, focus]);

  return (
    <iframe
      ref={frame}
      src={src}
      title="Map"
      style={{ border: 0, width: "100%", height: "100%" }}
    />
  );
};

export default MapView;
