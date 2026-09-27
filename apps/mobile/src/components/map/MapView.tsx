import { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { buildMapHtml, MAP_BASE_URL, markersScript } from "./mapHtml";
import type { MapOptions } from "./mapHtml";

export type MapViewProps = MapOptions;

// MapLibre GL rendered in a WebView: no native map SDK or API key to configure
const MapView = (props: MapViewProps) => {
  const { latitude, longitude, zoom, onLoad, markers, fitToMarkers = false, onMarkerPress } = props;
  const webView = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);

  // The document is built once; later prop changes are pushed into the live map
  const [html] = useState(() => buildMapHtml(props));

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
        if (data.includes('"ready"')) setIsReady(true);
        if (data.includes('"loaded"')) onLoad?.();
        if (data.includes('"marker"')) {
          try {
            onMarkerPress?.(String((JSON.parse(data) as { id: string }).id));
          } catch {
            // ignore malformed messages
          }
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
