import type { FastifyRequest, FastifyReply } from 'fastify';
import { reverseGeocodeSchema } from '../validators/location.validator.js';
import { ReverseGeocodeQuery } from '../services/locations/queries/reverseGeocode.query.js';
import { SearchLocationQuery } from '../services/locations/queries/searchLocation.query.js';
import { successResponse } from '../utils/response.js';

const reverseGeocodeQuery = new ReverseGeocodeQuery();
const searchLocationQuery = new SearchLocationQuery();

const MAX_SEARCH_LIMIT = 50;

export const locationController = {
  async reverseGeocode(request: FastifyRequest, reply: FastifyReply) {
    const { latitude, longitude } = reverseGeocodeSchema.parse(request.body);
    const result = await reverseGeocodeQuery.execute(latitude, longitude);
    return reply.status(200).send(successResponse(result, 'Location resolved successfully.'));
  },

  async search(request: FastifyRequest, reply: FastifyReply) {
    const { q } = request.query as { q?: string };
    const limitInput = Number((request.query as { limit?: string }).limit);
    const limit = Number.isFinite(limitInput) ? Math.min(Math.max(1, limitInput), MAX_SEARCH_LIMIT) : 20;
    if (!q || !q.trim()) {
      return reply.status(400).send({
        success: false,
        message: 'Search query is required.',
      });
    }
    const results = await searchLocationQuery.execute(q, limit);
    return reply.status(200).send(successResponse(results, 'Locations found.'));
  },
};
