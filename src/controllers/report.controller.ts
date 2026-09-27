import type { FastifyRequest, FastifyReply } from 'fastify';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import {
  activityQuerySchema,
  createReportSchema,
  getReportsQuerySchema,
  neighborhoodQuerySchema,
  reportIdSchema,
} from '../validators/report.validator.js';
import { GetNeighborhoodActivityQuery } from '../services/reports/queries/getNeighborhoodActivity.query.js';
import { resolveNeighborhoodId } from '../utils/neighborhood.js';
import { CreateReportCommand } from '../services/reports/commands/createReport.command.js';
import { DeleteReportCommand } from '../services/reports/commands/deleteReport.command.js';
import { ReportPowerOffCommand } from '../services/reports/commands/reportPowerOff.command.js';
import { ReportsPowerOnCommand } from '../services/reports/commands/reportsPowerOn.command.js';
import { GetReportQuery } from '../services/reports/queries/getReport.query.js';
import { GetReportsQuery } from '../services/reports/queries/getReports.query.js';
import { GetUserReportsQuery } from '../services/reports/queries/getUserReports.query.js';
import { GetReportsByLocationQuery } from '../services/reports/queries/getReportsByLocation.query.js';
import { GetLatestStatusQuery } from '../services/reports/queries/getLatestStatus.query.js';
import { GetOutagesQuery } from '../services/reports/queries/getOutages.query.js';
import { GetOutageQuery } from '../services/reports/queries/getOutage.query.js';
import { successResponse } from '../utils/response.js';
import { POWER_MESSAGES } from '../constants/power.constant.js';
import type { CreateReportDto } from '../interfaces/index.js';

const createReportCommand = new CreateReportCommand();
const deleteReportCommand = new DeleteReportCommand();
const reportPowerOffCommand = new ReportPowerOffCommand();
const reportPowerOnCommand = new ReportsPowerOnCommand();
const getReportQuery = new GetReportQuery();
const getReportsQuery = new GetReportsQuery();
const getUserReportsQuery = new GetUserReportsQuery();
const getReportsByLocationQuery = new GetReportsByLocationQuery();
const getLatestStatusQuery = new GetLatestStatusQuery();
const getNeighborhoodActivityQuery = new GetNeighborhoodActivityQuery();
const getOutagesQuery = new GetOutagesQuery();
const getOutageQuery = new GetOutageQuery();

function buildReportDto(request: FastifyRequest, reportType?: 'ON' | 'OFF'): CreateReportDto {
  const authRequest = request as AuthenticatedRequest;
  const body = (request.body ?? {}) as Record<string, unknown>;
  const dto = createReportSchema.parse(reportType ? { ...body, reportType } : body);
  const result: CreateReportDto = {
    userId: authRequest.userId,
    neighborhoodId: dto.neighborhoodId,
    reportType: dto.reportType,
  };
  if (dto.latitude !== undefined) result.latitude = dto.latitude;
  if (dto.longitude !== undefined) result.longitude = dto.longitude;
  if (dto.deviceType !== undefined) result.deviceType = dto.deviceType;
  return result;
}

export const reportController = {
  async createReport(request: FastifyRequest, reply: FastifyReply) {
    const dto = buildReportDto(request);
    const result = await createReportCommand.execute(dto);
    return reply.status(201).send(successResponse(result, POWER_MESSAGES.REPORT_CREATED));
  },

  async reportPowerOff(request: FastifyRequest, reply: FastifyReply) {
    const result = await reportPowerOffCommand.execute(buildReportDto(request, 'OFF'));
    return reply.status(201).send(successResponse(result, POWER_MESSAGES.REPORT_CREATED));
  },

  async reportPowerOn(request: FastifyRequest, reply: FastifyReply) {
    const result = await reportPowerOnCommand.execute(buildReportDto(request, 'ON'));
    return reply.status(201).send(successResponse(result, POWER_MESSAGES.REPORT_CREATED));
  },

  async getReport(request: FastifyRequest, reply: FastifyReply) {
    const { id } = reportIdSchema.parse(request.params);
    const result = await getReportQuery.execute(id);
    return reply.status(200).send(successResponse(result, POWER_MESSAGES.REPORT_FETCHED));
  },

  async getReports(request: FastifyRequest, reply: FastifyReply) {
    const params = getReportsQuerySchema.parse(request.query);
    const executeParams: {
      neighborhoodId?: number;
      reportType?: 'ON' | 'OFF';
      startDate?: string;
      endDate?: string;
      page: number;
      limit: number;
    } = { page: params.page, limit: params.limit };
    if (params.neighborhoodId !== undefined) executeParams.neighborhoodId = params.neighborhoodId;
    if (params.reportType !== undefined) executeParams.reportType = params.reportType;
    if (params.startDate !== undefined) executeParams.startDate = params.startDate;
    if (params.endDate !== undefined) executeParams.endDate = params.endDate;
    const result = await getReportsQuery.execute(executeParams);
    return reply.status(200).send(successResponse(result, POWER_MESSAGES.REPORTS_FETCHED));
  },

  async getUserReports(request: FastifyRequest, reply: FastifyReply) {
    const authRequest = request as AuthenticatedRequest;
    const { page, limit } = getReportsQuerySchema.parse(request.query);
    const result = await getUserReportsQuery.execute(authRequest.userId, page, limit);
    return reply.status(200).send(successResponse(result, POWER_MESSAGES.REPORTS_FETCHED));
  },

  async getReportsByLocation(request: FastifyRequest, reply: FastifyReply) {
    const params = getReportsQuerySchema.parse(request.query);
    if (params.neighborhoodId === undefined) {
      return reply.status(400).send({ success: false, message: 'neighborhoodId is required.' });
    }
    const result = await getReportsByLocationQuery.execute(params.neighborhoodId, params.page, params.limit);
    return reply.status(200).send(successResponse(result, POWER_MESSAGES.REPORTS_FETCHED));
  },

  async getLatestStatus(request: FastifyRequest, reply: FastifyReply) {
    const authRequest = request as AuthenticatedRequest;
    const query = neighborhoodQuerySchema.parse(request.query);
    const neighborhoodId = await resolveNeighborhoodId(authRequest.userId, query.neighborhoodId);
    const result = await getLatestStatusQuery.execute(neighborhoodId);
    return reply.status(200).send(successResponse(result, POWER_MESSAGES.LIVE_STATUS_FETCHED));
  },

  async getActivity(request: FastifyRequest, reply: FastifyReply) {
    const authRequest = request as AuthenticatedRequest;
    const query = activityQuerySchema.parse(request.query);
    const neighborhoodId = await resolveNeighborhoodId(authRequest.userId, query.neighborhoodId);
    const result = await getNeighborhoodActivityQuery.execute(neighborhoodId, query.limit);
    return reply.status(200).send(successResponse(result, POWER_MESSAGES.ACTIVITY_FETCHED));
  },

  async deleteReport(request: FastifyRequest, reply: FastifyReply) {
    const authRequest = request as AuthenticatedRequest;
    const { id } = reportIdSchema.parse(request.params);
    await deleteReportCommand.execute(id, {
      userId: authRequest.userId,
      role: authRequest.userRole,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });
    return reply.status(200).send(successResponse({}, POWER_MESSAGES.REPORT_DELETED));
  },

  async getOutages(request: FastifyRequest, reply: FastifyReply) {
    const { neighborhoodId, activeOnly, page, limit } = request.query as {
      neighborhoodId?: string; activeOnly?: string; page?: string; limit?: string;
    };
    const params: { neighborhoodId?: number; activeOnly?: boolean; page: number; limit: number } = {
      activeOnly: activeOnly === 'true',
      page: Math.max(1, Number(page) || 1),
      limit: Math.min(100, Math.max(1, Number(limit) || 20)),
    };
    if (neighborhoodId !== undefined) {
      const parsed = Number(neighborhoodId);
      if (!isNaN(parsed)) params.neighborhoodId = parsed;
    }
    const result = await getOutagesQuery.execute(params);
    return reply.status(200).send(successResponse(result, POWER_MESSAGES.OUTAGES_FETCHED));
  },

  async getOutage(request: FastifyRequest, reply: FastifyReply) {
    const { id } = reportIdSchema.parse(request.params);
    const result = await getOutageQuery.execute(id);
    return reply.status(200).send(successResponse(result, 'Outage fetched.'));
  },
};
