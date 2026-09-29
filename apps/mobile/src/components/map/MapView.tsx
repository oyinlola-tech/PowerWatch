import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { buildMapHtml, flyToScript, homeLocationScript, MAP_BASE_URL, markersScript, parseMapMessage, userLocationScript } from "./mapHtml";
import type { MapOptions } from "./mapHtml";
import { useTheme } from "../../theme/ThemeContext";

export type MapViewProps = MapOptions;

// MapLibre GL rendered in a WebView: no native map SDK or API key to configure
const MapView = (props: MapViewProps) => {
  const { latitude, longitude, zoom, onLoad, markers, fitToMarkers = false, onMarkerPress, onMove, userLocation, homeLocation, focus } = props;
  const webView = useRef<WebView>(null);
  const { isDark } = useTheme();

  // The document is rebuilt only when the theme changes; later prop changes are
  // pushed into the live map
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const html = useMemo(() => buildMapHtml({ ...props, dark: isDark }), [isDark]);

  // Readiness belongs to one document, so a theme switch waits for the new map
  const [readyHtml, setReadyHtml] = useState<string | null>(null);
  const isReady = readyHtml === html;

  useEffect(() => {
    if (!isReady) return;
    webView.current?.injectJavaScript(
      `window.powerwatchMap && window.powerwatchMap.setView(${JSON.stringify({ latitude, longitude, zoom })}); true;`,
    );
  }, [isReady, latitude, longitude, zoom]);

  useEffect(() => {
    if (!isReady || !markers) return;
    webView.current?.injectJavaScript(markersScript(markers, fitToMarkers));
  }, [isReady, markers, fitToMarkers]);

  // The dot is re-sent after a theme switch too, since that builds a new map document
  useEffect(() => {
    if (!isReady) return;
    webView.current?.injectJavaScript(userLocationScript(userLocation ?? null));
  }, [isReady, userLocation]);

  useEffect(() => {
    if (!isReady) return;
    webView.current?.injectJavaScript(homeLocationScript(homeLocation ?? null));
  }, [isReady, homeLocation]);

  useEffect(() => {
    if (!isReady || !focus) return;
    webView.current?.injectJavaScript(flyToScript(focus));
  }, [isReady, focus]);

  return (
    <WebView
      ref={webView}
      source={{ html, baseUrl: MAP_BASE_URL }}
      originWhitelist={["*"]}
      style={styles.map}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      setSupportMultipleWindows={false}
      onMessage={(event) => {
        const { data } = event.nativeEvent;
        if (data.includes('"ready"')) setReadyHtml(html);
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
      }}
      // Keep taps on links (map attribution) from navigating the map away
      onShouldStartLoadWithRequest={(request) =>
        request.url.startsWith(MAP_BASE_URL) || request.url === "about:blank"
      }
    />
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
    backgroundColor: "transparent",
  },
});

export default MapView;
