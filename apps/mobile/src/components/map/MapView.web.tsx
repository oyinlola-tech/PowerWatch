import { useEffect, useRef, useState } from "react";
import { buildMapHtml } from "./mapHtml";
import type { MapMarker, MapOptions } from "./mapHtml";

export type MapViewProps = MapOptions;

interface MapWindow extends Window {
  powerwatchMap?: {
    setView: (view: { latitude: number; longitude: number; zoom: number }) => void;
    setMarkers: (markers: MapMarker[], fit: boolean) => void;
  };
}

// Browser preview of the native MapView (used with `expo start --web`)
const MapView = (props: MapViewProps) => {
  const { latitude, longitude, zoom, onLoad, markers, fitToMarkers = false, onMarkerPress } = props;
  const frame = useRef<HTMLIFrameElement>(null);
  // A blob URL gives the document this page's origin, which MapLibre's worker needs
  const [src] = useState(() =>
    URL.createObjectURL(new Blob([buildMapHtml(props)], { type: "text/html" })),
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => () => URL.revokeObjectURL(src), [src]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      const data = String(event.data);
      if (data.includes('"ready"')) setIsReady(true);
      if (data.includes('"loaded"')) onLoad?.();
      if (data.includes('"marker"')) {
        try {
          onMarkerPress?.(String((JSON.parse(data) as { id: string }).id));
        } catch {
          // ignore malformed messages
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onLoad, onMarkerPress]);

  // The "ready" message can fire before the listener above is attached, so also
  // poll for the map API until it appears.
  useEffect(() => {
    if (isReady) return;
    const timer = setInterval(() => {
      if ((frame.current?.contentWindow as MapWindow | null)?.powerwatchMap) setIsReady(true);
    }, 250);
    return () => clearInterval(timer);
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;
    const map = (frame.current?.contentWindow as MapWindow | null)?.powerwatchMap;
    map?.setView({ latitude, longitude, zoom });
  }, [isReady, latitude, longitude, zoom]);

  useEffect(() => {
    if (!isReady || !markers) return;
    (frame.current?.contentWindow as MapWindow | null)?.powerwatchMap?.setMarkers(markers, fitToMarkers);
  }, [isReady, markers, fitToMarkers]);

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
