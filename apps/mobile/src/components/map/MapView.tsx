import { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { buildMapHtml, MAP_BASE_URL } from "./mapHtml";
import type { MapOptions } from "./mapHtml";

export type MapViewProps = MapOptions;

// MapLibre GL rendered in a WebView: no native map SDK or API key to configure
const MapView = (props: MapViewProps) => {
  const { latitude, longitude, zoom, onLoad } = props;
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
