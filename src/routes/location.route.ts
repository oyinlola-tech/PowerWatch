import type { FastifyPluginAsync } from 'fastify';
import { locationController } from '../controllers/location.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const ok = (data: object) => ({
  200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data } },
});

const statusField = { type: 'string', enum: ['ON', 'OFF', 'UNKNOWN'] } as const;

export const locationRoutes: FastifyPluginAsync = async (app) => {
  app.post('/reverse-geocode', {
    preHandler: [authMiddleware],
    // Each call may hit OpenStreetMap Nominatim, whose policy is ~1 request/second.
    config: { rateLimit: { max: 10, timeWindow: 60_000 } },
    schema: {
      security: [{ bearerAuth: [] }],
      description: 'Resolve GPS coordinates to the nearest country, state, LGA, city, town, and neighborhood. Uses OSM Nominatim with nigeria-lga-data fallback.',
      tags: ['Locations'],
      summary: 'Reverse geocode coordinates',
      body: {
        type: 'object',
        required: ['latitude', 'longitude'],
        properties: {
          latitude: { type: 'number', description: 'GPS latitude', example: 6.524379 },
          longitude: { type: 'number', description: 'GPS longitude', example: 3.379206 },
        },
      },
      response: {
        200: {
          description: 'Location resolved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Location resolved successfully.' },
            data: {
              type: 'object',
              properties: {
                countryId: { type: 'integer', example: 1 },
                country: { type: 'string', example: 'Nigeria' },
                stateId: { type: 'integer', example: 25 },
                state: { type: 'string', example: 'Ondo' },
                lgaId: { type: 'integer', example: 210 },
                lga: { type: 'string', example: 'Okitipupa' },
                cityId: { type: 'integer', example: 815 },
                city: { type: 'string', example: 'Okitipupa' },
                townId: { type: 'integer', example: 4200 },
                town: { type: 'string', example: 'Ipogun' },
                neighborhoodId: { type: 'integer', example: 9012 },
                neighborhood: { type: 'string', example: 'Central' },
                distanceKm: { type: 'number', example: 0 },
                suburb: { type: 'string', nullable: true, example: 'Ikeja' },
                village: { type: 'string', nullable: true, example: 'Abule Egba' },
                road: { type: 'string', nullable: true, example: 'Opebi Road' },
              },
            },
          },
        },
        400: { description: 'Invalid coordinates' },
        404: { description: 'No location found for coordinates' },
      },
    },
  }, locationController.reverseGeocode);

  app.get('/search', {
    schema: {
      description: 'Search for locations (neighborhoods, towns, cities, LGAs) by name. Returns results with full hierarchy (state → LGA → city → town → neighborhood).',
      tags: ['Locations'],
      summary: 'Search locations by name',
      querystring: {
        type: 'object',
        required: ['q'],
        properties: {
          q: { type: 'string', description: 'Search term', example: 'Ikeja' },
          limit: { type: 'integer', description: 'Max results (default 20, max 50)', example: 20 },
        },
      },
      response: {
        200: {
          description: 'Search results',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Locations found.' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['state', 'lga', 'city', 'town', 'neighborhood'], example: 'neighborhood' },
                  id: { type: 'integer', example: 9012 },
                  name: { type: 'string', example: 'Ikeja' },
                  stateId: { type: 'integer', example: 25 },
                  state: { type: 'string', example: 'Lagos' },
                  lgaId: { type: 'integer', example: 210 },
                  lga: { type: 'string', example: 'Ikeja' },
                  cityId: { type: 'integer', example: 815 },
                  city: { type: 'string', example: 'Ikeja' },
                  townId: { type: 'integer', example: 4200 },
                  town: { type: 'string', example: 'Ikeja' },
                  neighborhoodId: { type: 'integer', nullable: true, example: 9012 },
                  neighborhood: { type: 'string', nullable: true, example: 'Ikeja' },
                },
              },
            },
          },
        },
        400: { description: 'Missing search query' },
      },
    },
  }, locationController.search);

  app.get('/status-map', {
    preHandler: [authMiddleware],
    schema: {
      description:
        'Power status for a map. With lgaId: one point per neighborhood. With stateId: one point per LGA with ' +
        'outage counts (heatmap). Neither: the user\'s LGA. Points without their own coordinates fall back to the ' +
        'town/city/LGA location; `precision` says which was used.',
      tags: ['Locations'],
      summary: 'Status map / heatmap data',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: { lgaId: { type: 'integer' }, stateId: { type: 'integer' } },
      },
      response: ok({
        type: 'object',
        properties: {
          lga: { type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' } } },
          state: { type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' } } },
          neighborhoods: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                town: { type: 'string' },
                status: statusField,
                outageSince: { type: 'string', format: 'date-time', nullable: true },
                latitude: { type: 'number', nullable: true },
                longitude: { type: 'number', nullable: true },
                precision: { type: 'string', enum: ['neighborhood', 'town', 'city', 'lga', 'none'] },
              },
            },
          },
          lgas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                latitude: { type: 'number', nullable: true },
                longitude: { type: 'number', nullable: true },
                neighborhoods: { type: 'integer' },
                neighborhoodsOff: { type: 'integer' },
                neighborhoodsOn: { type: 'integer' },
                outagePercent: { type: 'integer', nullable: true },
              },
            },
          },
        },
      }),
    },
  }, locationController.statusMap);

  app.get('/saved', {
    preHandler: [authMiddleware],
    schema: {
      description: 'List the user\'s saved neighborhoods with their current power status.',
      tags: ['Locations'],
      summary: 'List saved neighborhoods',
      security: [{ bearerAuth: [] }],
      response: ok({
        type: 'array',
        items: {
          type: 'object',
          properties: {
            neighborhoodId: { type: 'integer' },
            name: { type: 'string' },
            town: { type: 'string' },
            label: { type: 'string', nullable: true },
            status: statusField,
            outageSince: { type: 'string', format: 'date-time', nullable: true },
            savedAt: { type: 'string', format: 'date-time' },
          },
        },
      }),
    },
  }, locationController.listSaved);

  app.post('/saved', {
    preHandler: [authMiddleware],
    schema: {
      description:
        'Save a neighborhood to follow (up to 10). Saved neighborhoods also get outage/restoration alerts.',
      tags: ['Locations'],
      summary: 'Save neighborhood',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['neighborhoodId'],
        properties: {
          neighborhoodId: { type: 'integer', example: 9012 },
          label: { type: 'string', maxLength: 50, example: 'Office' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                neighborhoodId: { type: 'integer' },
                label: { type: 'string', nullable: true },
                savedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
  }, locationController.saveNeighborhood);

  app.delete('/saved/:neighborhoodId', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Remove a saved neighborhood.',
      tags: ['Locations'],
      summary: 'Remove saved neighborhood',
      security: [{ bearerAuth: [] }],
      params: { type: 'object', required: ['neighborhoodId'], properties: { neighborhoodId: { type: 'integer' } } },
      response: ok({ type: 'object', additionalProperties: true }),
    },
  }, locationController.removeSaved);
};
