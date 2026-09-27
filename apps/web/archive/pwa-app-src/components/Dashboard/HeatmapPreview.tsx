// src/components/dashboard/HeatmapPreview.tsx
import { Clock } from "lucide-react";
import Map, { NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { HeatmapData } from "../../types/dashboard";

interface HeatmapPreviewProps {
  onViewHeatmap: () => void;
  heatmapData?: HeatmapData; // Make it optional with ?
  totalNodes?: number;
  activeNodes?: number;
  offlineNodes?: number;
  gridHealth?: number;
  lastUpdated?: string;
}

// Default sample data if none provided
const defaultHeatmapData: HeatmapData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749],
      },
      properties: {
        status: 'on',
        confidence: 98,
        lastUpdate: '2m ago',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.4294, 37.7849],
      },
      properties: {
        status: 'on',
        confidence: 95,
        lastUpdate: '5m ago',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.4094, 37.7649],
      },
      properties: {
        status: 'off',
        confidence: 87,
        lastUpdate: '10m ago',
      },
    },
  ],
};

const HeatmapPreview = ({ 
  onViewHeatmap,
  heatmapData = defaultHeatmapData, // Use default if not provided
  totalNodes = 3450,
  // activeNodes = 3438,
  offlineNodes = 12,
  gridHealth = 98,
  lastUpdated = "2 mins ago"
}: HeatmapPreviewProps) => {
  // Calculate center from data or use fallback
  const getCenter = () => {
    if (heatmapData.features.length === 0) {
      return { longitude: -122.4194, latitude: 37.7749 };
    }
    
    const lons = heatmapData.features.map(f => f.geometry.coordinates[0]);
    const lats = heatmapData.features.map(f => f.geometry.coordinates[1]);
    
    return {
      longitude: lons.reduce((a, b) => a + b, 0) / lons.length,
      latitude: lats.reduce((a, b) => a + b, 0) / lats.length,
    };
  };

  const center = getCenter();
  const viewState = {
    longitude: center.longitude,
    latitude: center.latitude,
    zoom: 11,
  };

  return (
    <div className="mt-6">

      {/* Heatmap Preview Card */}
      <button
        onClick={onViewHeatmap}
        className="group relative mt-3 h-48 w-full overflow-hidden rounded-2xl text-left transition-all duration-300 hover:shadow-lg hover:shadow-[#0663EA]/20"
      >
        {/* Map */}
        <div className="absolute inset-0">
          <Map
            {...viewState}
            mapStyle="https://basemaps.cartodownload.com/gl/positron-gl-style/style.json"
            style={{ width: "100%", height: "100%" }}
            interactive={false}
            dragPan={false}
            scrollZoom={false}
            doubleClickZoom={false}
            touchZoomRotate={false}
          >
            {/* Heatmap markers from data */}
            {heatmapData.features.map((point, i) => {
              const [longitude, latitude] = point.geometry.coordinates;
              const isOn = point.properties.status === 'on';
              
              return (
                <div
                  key={i}
                  className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${
                    isOn 
                      ? 'bg-green-500 shadow-lg shadow-green-500/50 hover:scale-150' 
                      : 'bg-red-500 shadow-lg shadow-red-500/50 hover:scale-150'
                  }`}
                  style={{
                    left: `${((longitude - (center.longitude - 0.05)) / 0.1) * 100}%`,
                    top: `${((latitude - (center.latitude - 0.05)) / 0.1) * 100}%`,
                  }}
                  title={`${isOn ? 'ON' : 'OFF'} - Confidence: ${point.properties.confidence}%`}
                />
              );
            })}
            <NavigationControl showCompass={false} position="bottom-right" />
          </Map>
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Stats overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-white/60">
                  Total Nodes
                </span>
                <p className="text-sm font-bold text-white">{totalNodes.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-white/60">
                  Grid Health
                </span>
                <p className="text-sm font-bold text-green-400">{gridHealth}%</p>
              </div>
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-white/60">
                  Offline
                </span>
                <p className="text-sm font-bold text-red-400">{offlineNodes}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-white/40" />
              <span className="text-[10px] font-medium text-white/40">
                {lastUpdated}
              </span>
            </div>
          </div>
        </div>

        {/* "View Heatmap" label */}
        <div className="absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-xs font-medium text-white">View Heatmap</span>
        </div>
      </button>
    </div>
  );
};

export default HeatmapPreview;