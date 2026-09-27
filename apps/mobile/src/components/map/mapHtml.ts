const MAPLIBRE_VERSION = "6.11.2";
const MAPLIBRE_CDN = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist`;

// OpenStreetMap-based street style, the closest free match to the map in the design
export const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

// MapLibre loads its worker from the page origin, so the document needs a real one
export const MAP_BASE_URL = "https://localhost/";

export interface MapOptions {
  latitude: number;
  longitude: number;
  zoom: number;
  interactive: boolean;
  /** Called once the map has drawn its first complete frame */
  onLoad?: () => void;
}

export const buildMapHtml = ({ latitude, longitude, zoom, interactive }: MapOptions) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <link rel="stylesheet" href="${MAPLIBRE_CDN}/maplibre-gl.css" />
    <style>
      html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
      body { background: transparent; overflow: hidden; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script type="module">
      import * as maplibre from "${MAPLIBRE_CDN}/maplibre-gl.mjs";

      const post = (message) => {
        const payload = JSON.stringify(message);
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(payload);
        else window.parent.postMessage(payload, "*");
      };

      const map = new maplibre.Map({
        container: "map",
        style: ${JSON.stringify(MAP_STYLE)},
        center: [${longitude}, ${latitude}],
        zoom: ${zoom},
        interactive: ${interactive},
        attributionControl: { compact: true },
      });

      // Keep the attribution collapsed to its info button so it doesn't cover
      // the controls drawn over the map
      const collapseAttribution = () => {
        const attribution = document.querySelector(".maplibregl-ctrl-attrib");
        if (!attribution) return;
        attribution.classList.remove("maplibregl-compact-show");
        attribution.removeAttribute("open");
      };
      map.once("load", collapseAttribution);
      map.once("idle", collapseAttribution);

      window.powerwatchMap = {
        setView: (view) => map.easeTo({ center: [view.longitude, view.latitude], zoom: view.zoom }),
      };
      post({ type: "ready" });

      map.once("idle", () => post({ type: "loaded" }));
      map.on("error", (event) => post({ type: "error", message: String(event.error && event.error.message) }));
    </script>
  </body>
</html>`;
