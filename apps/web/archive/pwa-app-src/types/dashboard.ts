// src/types/dashboard.ts

export type PowerStatus = "on" | "off";

export interface PowerStatusData {
  status: PowerStatus;
  confirmedByCount: number;
  confidence: number; // 0-100
  lastUpdate: string; // e.g. "2m ago"
}

export interface ActivityReport {
  id: string;
  status: PowerStatus;
  area: string;
  timeAgo: string;
  timestamp: string;
  location: string;
}

export interface HeatmapStats {
  totalNodes: number;
  activeNodes: number;
  offlineNodes: number;
  gridHealth: number; // 0-100
  lastUpdated: string;
}

// GeoJSON format for heatmap data points
export interface HeatmapDataPoint {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    status: 'on' | 'off';
    confidence: number;
    lastUpdate: string;
  };
}

// GeoJSON FeatureCollection for the entire heatmap
export interface HeatmapData {
  type: 'FeatureCollection';
  features: HeatmapDataPoint[];
}

export interface DashboardData {
  powerStatus: PowerStatusData;
  activityReports: ActivityReport[];
  heatmapStats: HeatmapStats;
  heatmapData: HeatmapData; // Add this for the actual map data
}