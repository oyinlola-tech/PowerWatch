import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { GetDashboardQuery } from '../services/admin/queries/getDashboard.query.js';
import { GetAnalyticsQuery } from '../services/admin/queries/getAnalytics.query.js';
import { GetUsersQuery } from '../services/admin/queries/getUsers.query.js';
import { GetLocationsQuery } from '../services/admin/queries/getLocations.query.js';
import { UpdateLocationCommand } from '../services/admin/commands/updateLocation.command.js';
import { SuspendUserCommand, UnsuspendUserCommand } from '../services/admin/commands/suspendUser.command.js';
import { DeleteUserCommand } from '../services/admin/commands/deleteUser.command.js';
import { DeleteReportCommand } from '../services/reports/commands/deleteReport.command.js';
import { SendBroadcastCommand } from '../services/admin/commands/sendBroadcast.command.js';
import { GetSystemEventsQuery } from '../services/admin/queries/getSystemEvents.query.js';
import { ResolveSystemEventCommand } from '../services/admin/commands/resolveSystemEvent.command.js';
import { MaterializeDailySummaryCommand } from '../services/analytics/commands/materializeDailySummary.command.js';
import { MaterializeWeeklySummaryCommand } from '../services/analytics/commands/materializeWeeklySummary.command.js';
import { MaterializeMonthlySummaryCommand } from '../services/analytics/commands/materializeMonthlySummary.command.js';
import type { AdminActor } from '../services/admin/commands/adminActor.js';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { successResponse } from '../utils/response.js';
import { AppError } from '../errors/index.js';

const getDashboardQuery = new GetDashboardQuery();
const getAnalyticsQuery = new GetAnalyticsQuery();
const getUsersQuery = new GetUsersQuery();
const getLocationsQuery = new GetLocationsQuery();
const updateLocationCommand = new UpdateLocationCommand();
const suspendUserCommand = new SuspendUserCommand();
const unsuspendUserCommand = new UnsuspendUserCommand();
const deleteUserCommand = new DeleteUserCommand();
const deleteReportCommand = new DeleteReportCommand();
const sendBroadcastCommand = new SendBroadcastCommand();
const getSystemEventsQuery = new GetSystemEventsQuery();
const resolveSystemEventCommand = new ResolveSystemEventCommand();

const systemEventsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['open', 'resolved', 'all']).default('open'),
  level: z.enum(['ERROR', 'WARNING']).optional(),
  source: z.enum(['email', 'push', 'job', 'geocoding', 'api', 'startup']).optional(),
});
const systemEventIdSchema = z.object({ id: z.uuid() });
const resolveAllSchema = z.object({
  source: z.enum(['email', 'push', 'job', 'geocoding', 'api', 'startup']).optional(),
});
const materializeDailyCommand = new MaterializeDailySummaryCommand();
const materializeWeeklyCommand = new MaterializeWeeklySummaryCommand();
const materializeMonthlyCommand = new MaterializeMonthlySummaryCommand();

const userIdParamsSchema = z.object({ userId: z.uuid() });
const reportIdParamsSchema = z.object({ id: z.uuid() });

const sendBroadcastSchema = z.object({
  // Phones cut push titles and text short, so keep them brief
  title: z.string().trim().min(1).max(100),
  body: z.string().trim().min(1).max(500),
  audience: z
    .discriminatedUnion('type', [
      z.object({ type: z.literal('all') }),
      z.object({ type: z.literal('users'), userIds: z.array(z.uuid()).min(1).max(500) }),
      z.object({ type: z.literal('neighborhood'), neighborhoodId: z.number().int().positive() }),
      z.object({ type: z.literal('lga'), lgaId: z.number().int().positive() }),
      z.object({ type: z.literal('state'), stateId: z.number().int().positive() }),
    ])
    .default({ type: 'all' }),
  dryRun: z.boolean().optional(),
});

function getActor(request: FastifyRequest): AdminActor {
  return {
    userId: (request as AuthenticatedRequest).userId,
    ipAddress: request.ip,
    userAgent: request.headers['user-agent'],
  };
}

export const adminController = {
  async getDashboard(_request: FastifyRequest, reply: FastifyReply) {
    const result = await getDashboardQuery.execute();
    return reply.status(200).send(successResponse(result, 'Dashboard fetched.'));
  },

  async getAnalytics(request: FastifyRequest, reply: FastifyReply) {
    const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };
    const params: { startDate?: string; endDate?: string } = {};
    if (startDate !== undefined) params.startDate = startDate;
    if (endDate !== undefined) params.endDate = endDate;
    const result = await getAnalyticsQuery.execute(params);
    return reply.status(200).send(successResponse(result, 'Analytics fetched.'));
  },

  async getUsers(request: FastifyRequest, reply: FastifyReply) {
    const { page, limit, search, role } = request.query as {
      page?: string; limit?: string; search?: string; role?: string;
    };
    const params: { page: number; limit: number; search?: string; role?: string } = {
      page: Math.max(1, Number(page) || 1),
      limit: Math.min(100, Math.max(1, Number(limit) || 20)),
    };
    if (search !== undefined) params.search = search;
    if (role !== undefined) {
      if (role !== 'USER' && role !== 'ADMIN') throw new AppError(400, 'role must be USER or ADMIN.');
      params.role = role;
    }
    const result = await getUsersQuery.execute(params);
    return reply.status(200).send(successResponse(result, 'Users fetched.'));
  },

  async getLocations(_request: FastifyRequest, reply: FastifyReply) {
    const result = await getLocationsQuery.execute();
    return reply.status(200).send(successResponse(result, 'Locations fetched.'));
  },

  async updateLocation(request: FastifyRequest, reply: FastifyReply) {
    const updateLocationSchema = z.object({
      type: z.enum(['state', 'lga', 'city', 'town', 'neighborhood']),
      id: z.number().int().positive(),
      name: z.string().trim().min(1).max(100),
    });
    const { type, id, name } = updateLocationSchema.parse(request.body);
    const result = await updateLocationCommand.execute({ type, id, name });
    return reply.status(200).send(successResponse(result, 'Location updated.'));
  },

  async suspendUser(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = userIdParamsSchema.parse(request.params);
    await suspendUserCommand.execute(userId, getActor(request));
    return reply.status(200).send(successResponse({}, 'User suspended.'));
  },

  async unsuspendUser(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = userIdParamsSchema.parse(request.params);
    await unsuspendUserCommand.execute(userId, getActor(request));
    return reply.status(200).send(successResponse({}, 'User unsuspended.'));
  },

  async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = userIdParamsSchema.parse(request.params);
    await deleteUserCommand.execute(userId, getActor(request));
    return reply.status(200).send(successResponse({}, 'User deleted.'));
  },

  async deleteReport(request: FastifyRequest, reply: FastifyReply) {
    const { id } = reportIdParamsSchema.parse(request.params);
    await deleteReportCommand.execute(id, { ...getActor(request), role: 'ADMIN' });
    return reply.status(200).send(successResponse({}, 'Report deleted.'));
  },

  async sendBroadcast(request: FastifyRequest, reply: FastifyReply) {
    const { title, body, audience, dryRun } = sendBroadcastSchema.parse(request.body);
    const result = await sendBroadcastCommand.execute(
      { title, body, audience, ...(dryRun ? { dryRun } : {}) },
      getActor(request),
    );
    return reply.status(200).send(successResponse(result, dryRun ? 'Audience counted. Nothing was sent.' : 'Message sent.'));
  },

  async materializeDaily(request: FastifyRequest, reply: FastifyReply) {
    const { date } = request.query as { date?: string };
    const parsed = date ? new Date(date) : undefined;
    const result = await materializeDailyCommand.execute(parsed && !isNaN(parsed.getTime()) ? parsed : undefined);
    return reply.status(200).send(successResponse(result, 'Daily summaries materialized.'));
  },

  async materializeWeekly(request: FastifyRequest, reply: FastifyReply) {
    const { weekStart } = request.query as { weekStart?: string };
    const parsed = weekStart ? new Date(weekStart) : undefined;
    const result = await materializeWeeklyCommand.execute(parsed && !isNaN(parsed.getTime()) ? parsed : undefined);
    return reply.status(200).send(successResponse(result, 'Weekly summaries materialized.'));
  },

  async materializeMonthly(request: FastifyRequest, reply: FastifyReply) {
    const { monthStart } = request.query as { monthStart?: string };
    const parsed = monthStart ? new Date(monthStart) : undefined;
    const result = await materializeMonthlyCommand.execute(parsed && !isNaN(parsed.getTime()) ? parsed : undefined);
    return reply.status(200).send(successResponse(result, 'Monthly summaries materialized.'));
  },

  async getSystemEvents(request: FastifyRequest, reply: FastifyReply) {
    const { level, source, ...rest } = systemEventsQuerySchema.parse(request.query);
    const result = await getSystemEventsQuery.execute({
      ...rest,
      ...(level ? { level } : {}),
      ...(source ? { source } : {}),
    });
    return reply.status(200).send(successResponse(result, 'System events fetched.'));
  },

  async resolveSystemEvent(request: FastifyRequest, reply: FastifyReply) {
    const { id } = systemEventIdSchema.parse(request.params);
    const result = await resolveSystemEventCommand.execute(id, getActor(request).userId);
    return reply.status(200).send(successResponse(result, 'System event marked as resolved.'));
  },

  async resolveAllSystemEvents(request: FastifyRequest, reply: FastifyReply) {
    const { source } = resolveAllSchema.parse(request.body ?? {});
    const result = await resolveSystemEventCommand.resolveAll(getActor(request).userId, source ? { source } : {});
    return reply.status(200).send(successResponse(result, 'System events marked as resolved.'));
  },
};
