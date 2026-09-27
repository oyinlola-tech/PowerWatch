import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  reverseGeocodeSchema,
  saveNeighborhoodSchema,
  savedNeighborhoodParamsSchema,
  statusMapQuerySchema,
} from '../validators/location.validator.js';
import { GetStatusMapQuery } from '../services/locations/queries/getStatusMap.query.js';
import {
  ListSavedNeighborhoodsQuery,
  RemoveSavedNeighborhoodCommand,
  SaveNeighborhoodCommand,
} from '../services/locations/commands/savedNeighborhoods.commands.js';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../configs/database.config.js';
import { AppError } from '../errors/index.js';
import { POWER_MESSAGES } from '../constants/power.constant.js';
import { ReverseGeocodeQuery } from '../services/locations/queries/reverseGeocode.query.js';
import { SearchLocationQuery } from '../services/locations/queries/searchLocation.query.js';
import { successResponse } from '../utils/response.js';

const reverseGeocodeQuery = new ReverseGeocodeQuery();
const searchLocationQuery = new SearchLocationQuery();

const MAX_SEARCH_LIMIT = 50;
const getStatusMapQuery = new GetStatusMapQuery();
const listSavedNeighborhoodsQuery = new ListSavedNeighborhoodsQuery();
const saveNeighborhoodCommand = new SaveNeighborhoodCommand();
const removeSavedNeighborhoodCommand = new RemoveSavedNeighborhoodCommand();

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

  async statusMap(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request as AuthenticatedRequest;
    const { lgaId, stateId } = statusMapQuerySchema.parse(request.query);
    if (lgaId !== undefined) {
      return reply.status(200).send(successResponse(await getStatusMapQuery.byLga(lgaId), 'Status map fetched.'));
    }
    if (stateId !== undefined) {
      return reply.status(200).send(successResponse(await getStatusMapQuery.byState(stateId), 'Status map fetched.'));
    }
    // Default: the user's own LGA.
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { lgaId: true } });
    if (!user?.lgaId) throw new AppError(400, POWER_MESSAGES.NO_NEIGHBORHOOD);
    return reply.status(200).send(successResponse(await getStatusMapQuery.byLga(user.lgaId), 'Status map fetched.'));
  },

  async listSaved(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request as AuthenticatedRequest;
    const result = await listSavedNeighborhoodsQuery.execute(userId);
    return reply.status(200).send(successResponse(result, 'Saved neighborhoods fetched.'));
  },

  async saveNeighborhood(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request as AuthenticatedRequest;
    const { neighborhoodId, label } = saveNeighborhoodSchema.parse(request.body);
    const result = await saveNeighborhoodCommand.execute(userId, neighborhoodId, label);
    return reply.status(201).send(successResponse(result, 'Neighborhood saved.'));
  },

  async removeSaved(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request as AuthenticatedRequest;
    const { neighborhoodId } = savedNeighborhoodParamsSchema.parse(request.params);
    await removeSavedNeighborhoodCommand.execute(userId, neighborhoodId);
    return reply.status(200).send(successResponse({}, 'Neighborhood removed.'));
  },
};
