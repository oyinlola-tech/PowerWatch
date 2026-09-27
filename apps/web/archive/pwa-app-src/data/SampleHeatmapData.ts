// src/data/sampleHeatmapData.ts
import type { HeatmapData } from "../types/dashboard";

export const sampleHeatmapData: HeatmapData = {
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
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.4394, 37.7549],
      },
      properties: {
        status: 'on',
        confidence: 92,
        lastUpdate: '15m ago',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.3994, 37.7949],
      },
      properties: {
        status: 'off',
        confidence: 76,
        lastUpdate: '20m ago',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.4494, 37.7449],
      },
      properties: {
        status: 'on',
        confidence: 94,
        lastUpdate: '30m ago',
      },
    },
  ],
};