import type { FastifyPluginAsync } from 'fastify';
import { locationController } from '../controllers/location.controller.js';

export const locationRoutes: FastifyPluginAsync = async (app) => {
  app.post('/reverse-geocode', {
    schema: {
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
};
