const MAPLIBRE_VERSION = "6.11.2";
const MAPLIBRE_CDN = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist`;

// OpenStreetMap-based street style, the closest free match to the map in the design
export const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

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
  /** Called once the map has drawn its first complete frame */
  onLoad?: () => void;
  /** Coloured circles drawn over the map (status map, heatmap) */
  markers?: MapMarker[];
  /** Zoom to fit the markers whenever they change */
  fitToMarkers?: boolean;
  onMarkerPress?: (id: string) => void;
}

/** JS that pushes markers into the live map document */
export const markersScript = (markers: MapMarker[], fit: boolean) =>
  `window.powerwatchMap && window.powerwatchMap.setMarkers(${JSON.stringify(markers)}, ${fit}); true;`;

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
      map.on("error", (event) => post({ type: "error", message: String(event.error && event.error.message) }));
    </script>
  </body>
</html>`;
