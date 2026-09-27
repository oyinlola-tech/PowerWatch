import type { FastifyRequest, FastifyReply } from 'fastify';
import { GetPowerStatisticsQuery } from '../services/analytics/queries/getPowerStatistics.query.js';
import { GetOutageStatisticsQuery } from '../services/analytics/queries/getOutageStatistics.query.js';
import { GetUserStatisticsQuery } from '../services/analytics/queries/getUserStatistics.query.js';
import { GetLocationStatisticsQuery } from '../services/analytics/queries/getLocationStatistics.query.js';
import { successResponse } from '../utils/response.js';

const getPowerStatisticsQuery = new GetPowerStatisticsQuery();
const getOutageStatisticsQuery = new GetOutageStatisticsQuery();
const getUserStatisticsQuery = new GetUserStatisticsQuery();
const getLocationStatisticsQuery = new GetLocationStatisticsQuery();

export const analyticsController = {
  async getPowerStatistics(request: FastifyRequest, reply: FastifyReply) {
    const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };
    const params: { startDate?: string; endDate?: string } = {};
    if (startDate !== undefined) params.startDate = startDate;
    if (endDate !== undefined) params.endDate = endDate;
    const result = await getPowerStatisticsQuery.execute(params);
    return reply.status(200).send(successResponse(result, 'Power statistics fetched.'));
  },

  async getOutageStatistics(request: FastifyRequest, reply: FastifyReply) {
    const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };
    const params: { startDate?: string; endDate?: string } = {};
    if (startDate !== undefined) params.startDate = startDate;
    if (endDate !== undefined) params.endDate = endDate;
    const result = await getOutageStatisticsQuery.execute(params);
    return reply.status(200).send(successResponse(result, 'Outage statistics fetched.'));
  },

  async getUserStatistics(_request: FastifyRequest, reply: FastifyReply) {
    const result = await getUserStatisticsQuery.execute();
    return reply.status(200).send(successResponse(result, 'User statistics fetched.'));
  },

  async getLocationStatistics(_request: FastifyRequest, reply: FastifyReply) {
    const result = await getLocationStatisticsQuery.execute();
    return reply.status(200).send(successResponse(result, 'Location statistics fetched.'));
  },
};
