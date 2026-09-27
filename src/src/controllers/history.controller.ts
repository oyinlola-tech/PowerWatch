import type { FastifyRequest, FastifyReply } from 'fastify';
import { GetWeeklyHistoryQuery } from '../services/histories/queries/getWeeklyHistory.query.js';
import { GetMonthlyHistoryQuery } from '../services/histories/queries/getMonthlyHistory.query.js';
import { GetOutageHoursQuery } from '../services/histories/queries/getOutageHours.query.js';
import { GetPowerTimelineQuery } from '../services/histories/queries/getPowerTimeline.query.js';
import { successResponse } from '../utils/response.js';

const getWeeklyHistoryQuery = new GetWeeklyHistoryQuery();
const getMonthlyHistoryQuery = new GetMonthlyHistoryQuery();
const getOutageHoursQuery = new GetOutageHoursQuery();
const getPowerTimelineQuery = new GetPowerTimelineQuery();

export const historyController = {
  async getWeeklyHistory(request: FastifyRequest, reply: FastifyReply) {
    const { neighborhoodId, year, month } = request.query as {
      neighborhoodId?: string; year?: string; month?: string;
    };
    const params: { neighborhoodId?: number; year?: number; month?: number } = {};
    if (neighborhoodId !== undefined) {
      const parsed = Number(neighborhoodId);
      if (!isNaN(parsed)) params.neighborhoodId = parsed;
    }
    if (year !== undefined) params.year = Number(year);
    if (month !== undefined) params.month = Number(month);
    const result = await getWeeklyHistoryQuery.execute(params);
    return reply.status(200).send(successResponse(result, 'Weekly history fetched.'));
  },

  async getMonthlyHistory(request: FastifyRequest, reply: FastifyReply) {
    const { neighborhoodId, year } = request.query as {
      neighborhoodId?: string; year?: string;
    };
    const params: { neighborhoodId?: number; year?: number } = {};
    if (neighborhoodId !== undefined) {
      const parsed = Number(neighborhoodId);
      if (!isNaN(parsed)) params.neighborhoodId = parsed;
    }
    if (year !== undefined) params.year = Number(year);
    const result = await getMonthlyHistoryQuery.execute(params);
    return reply.status(200).send(successResponse(result, 'Monthly history fetched.'));
  },

  async getOutageHours(request: FastifyRequest, reply: FastifyReply) {
    const { neighborhoodId, startDate, endDate } = request.query as {
      neighborhoodId?: string; startDate?: string; endDate?: string;
    };
    const params: { neighborhoodId?: number; startDate?: string; endDate?: string } = {};
    if (neighborhoodId !== undefined) {
      const parsed = Number(neighborhoodId);
      if (!isNaN(parsed)) params.neighborhoodId = parsed;
    }
    if (startDate !== undefined) params.startDate = startDate;
    if (endDate !== undefined) params.endDate = endDate;
    const result = await getOutageHoursQuery.execute(params);
    return reply.status(200).send(successResponse(result, 'Outage hours fetched.'));
  },

  async getPowerTimeline(request: FastifyRequest, reply: FastifyReply) {
    const { neighborhoodId, startDate, endDate, interval } = request.query as {
      neighborhoodId?: string; startDate?: string; endDate?: string; interval?: string;
    };
    if (!neighborhoodId || !startDate || !endDate) {
      return reply.status(400).send({ success: false, message: 'neighborhoodId, startDate, and endDate are required.' });
    }
    const parsedNeighborhoodId = Number(neighborhoodId);
    if (isNaN(parsedNeighborhoodId)) {
      return reply.status(400).send({ success: false, message: 'neighborhoodId must be a valid number.' });
    }
    const params: { neighborhoodId: number; startDate: string; endDate: string; interval?: 'hour' | 'day' } = {
      neighborhoodId: parsedNeighborhoodId,
      startDate,
      endDate,
    };
    if (interval === 'hour' || interval === 'day') params.interval = interval;
    const result = await getPowerTimelineQuery.execute(params);
    return reply.status(200).send(successResponse(result, 'Power timeline fetched.'));
  },
};
