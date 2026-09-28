const MAPLIBRE_VERSION = "6.11.2";
const MAPLIBRE_CDN = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist`;

// Subresource Integrity hashes for the exact MapLibre files loaded from unpkg above,
// so a compromised or MITM'd CDN response can't silently execute different code.
// Recompute if MAPLIBRE_VERSION changes:
//   curl -sL <url> | openssl dgst -sha384 -binary | openssl base64 -A
const MAPLIBRE_CSS_INTEGRITY = "sha384-ntw3zEt6rcVML7jDK0ULmHa5hxLB23afsPqzqfY+gLgMfAkbFCnCgPpkZvV5mmZX";
const MAPLIBRE_JS_INTEGRITY = "sha384-KQzExYlfg1SnYNpLaXHTnaCTjr5wmiZ6X3sasvPb94caZfH+3+T1Sl4eJziXUtmN";
// maplibre-gl.mjs statically imports this chunk, so it needs its own integrity entry too.
const MAPLIBRE_SHARED_JS_INTEGRITY = "sha384-V59ofCEPEqpSk5Mswc19DtDYbZWJtne210dFzS328Il6O31eLwTV7v57+Z3NjW/7";

// OpenStreetMap-based street style, the closest free match to the map in the design
export const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
// Used in dark mode (Figma has no dark map; this is OpenFreeMap's own dark style)
export const MAP_STYLE_DARK = "https://tiles.openfreemap.org/styles/dark";

// MapLibre loads its worker from the page origin, so the document needs a real one
export const MAP_BASE_URL = "https://localhost/";

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  /** Fill colour, e.g. the power ON/OFF colour */
  color: string;
  /** Circle radius in px (default 8) */
  radius?: number;
}

export interface MapOptions {
  latitude: number;
  longitude: number;
  zoom: number;
  interactive: boolean;
  /** Dark map tiles, set by MapView from the app theme */
  dark?: boolean;
  /** Called once the map has drawn its first complete frame */
  onLoad?: () => void;
  /** Coloured circles drawn over the map (status map, heatmap) */
  markers?: MapMarker[];
  /** Zoom to fit the markers whenever they change */
  fitToMarkers?: boolean;
  onMarkerPress?: (id: string) => void;
  /** Called when a pan/zoom ends; `byUser` is false for programmatic moves */
  onMove?: (view: { latitude: number; longitude: number; zoom: number; byUser: boolean }) => void;
}

export interface MapMessage {
  type: string;
  id?: string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  byUser?: boolean;
}

/** Parses a message from the map document; returns null for anything unexpected */
export const parseMapMessage = (data: string): MapMessage | null => {
  try {
    const message = JSON.parse(data) as Partial<MapMessage>;
    return typeof message.type === "string" ? (message as MapMessage) : null;
  } catch {
    return null;
  }
};

/** JS that pushes markers into the live map document */
export const markersScript = (markers: MapMarker[], fit: boolean) =>
  `window.powerwatchMap && window.powerwatchMap.setMarkers(${JSON.stringify(markers)}, ${fit}); true;`;

export const buildMapHtml = ({ latitude, longitude, zoom, interactive, dark = false }: MapOptions) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <link
      rel="stylesheet"
      href="${MAPLIBRE_CDN}/maplibre-gl.css"
      integrity="${MAPLIBRE_CSS_INTEGRITY}"
      crossorigin="anonymous"
    />
    <style>
      html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
      body { background: transparent; overflow: hidden; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script type="importmap">
      ${JSON.stringify({
        integrity: {
          [`${MAPLIBRE_CDN}/maplibre-gl.mjs`]: MAPLIBRE_JS_INTEGRITY,
          [`${MAPLIBRE_CDN}/maplibre-gl-shared.mjs`]: MAPLIBRE_SHARED_JS_INTEGRITY,
        },
      })}
    </script>
    <script type="module">
      import * as maplibre from "${MAPLIBRE_CDN}/maplibre-gl.mjs";

      const post = (message) => {
        const payload = JSON.stringify(message);
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(payload);
        else window.parent.postMessage(payload, "*");
      };

      const map = new maplibre.Map({
        container: "map",
        style: ${JSON.stringify(dark ? MAP_STYLE_DARK : MAP_STYLE)},
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

      // Status markers: one GeoJSON circle layer, so hundreds of points stay fast.
      // map.loaded() is false while tiles download even after "load", so track the style ourselves.
      let styleReady = false;
      let pendingMarkers = null;
      const toGeoJson = (markers) => ({
        type: "FeatureCollection",
        features: markers.map((m) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [m.longitude, m.latitude] },
          properties: { id: m.id, color: m.color, radius: m.radius || 8 },
        })),
      });
      const applyMarkers = (markers, fit) => {
        const data = toGeoJson(markers);
        const source = map.getSource("markers");
        if (source) {
          source.setData(data);
        } else {
          map.addSource("markers", { type: "geojson", data });
          map.addLayer({
            id: "markers",
            type: "circle",
            source: "markers",
            paint: {
              "circle-color": ["get", "color"],
              "circle-radius": ["get", "radius"],
              "circle-opacity": 0.85,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#FFFFFF",
            },
          });
          map.on("click", "markers", (event) => {
            const feature = event.features && event.features[0];
            if (feature) post({ type: "marker", id: feature.properties.id });
          });
          map.on("mouseenter", "markers", () => (map.getCanvas().style.cursor = "pointer"));
          map.on("mouseleave", "markers", () => (map.getCanvas().style.cursor = ""));
        }
        if (fit && markers.length > 0) {
          const bounds = new maplibre.LngLatBounds();
          markers.forEach((m) => bounds.extend([m.longitude, m.latitude]));
          map.fitBounds(bounds, { padding: 48, maxZoom: 13, duration: 0 });
        }
      };
      map.once("load", () => {
        styleReady = true;
        if (pendingMarkers) applyMarkers(pendingMarkers.markers, pendingMarkers.fit);
        pendingMarkers = null;
      });

      window.powerwatchMap = {
        setView: (view) => map.easeTo({ center: [view.longitude, view.latitude], zoom: view.zoom }),
        setMarkers: (markers, fit) => {
          if (styleReady) applyMarkers(markers, fit);
          else pendingMarkers = { markers, fit };
        },
      };
      post({ type: "ready" });

      map.once("idle", () => post({ type: "loaded" }));

      // Report where the map settled; originalEvent is only set for user gestures
      map.on("moveend", (event) => {
        const center = map.getCenter();
        post({
          type: "move",
          latitude: center.lat,
          longitude: center.lng,
          zoom: map.getZoom(),
          byUser: Boolean(event.originalEvent),
        });
      });
      map.on("error", (event) => post({ type: "error", message: String(event.error && event.error.message) }));
    </script>
  </body>
</html>`;
