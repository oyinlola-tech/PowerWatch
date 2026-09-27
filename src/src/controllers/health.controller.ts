import type { FastifyRequest, FastifyReply } from 'fastify';
import { HealthCheckQuery } from '../services/health/queries/healthCheck.query.js';
import { DatabaseHealthQuery } from '../services/health/queries/databaseHealth.query.js';
import { FirebaseHealthQuery } from '../services/health/queries/firebaseHealth.query.js';
import { successResponse } from '../utils/response.js';

const healthCheckQuery = new HealthCheckQuery();
const databaseHealthQuery = new DatabaseHealthQuery();
const firebaseHealthQuery = new FirebaseHealthQuery();

export const healthController = {
  async healthCheck(_request: FastifyRequest, reply: FastifyReply) {
    const result = await healthCheckQuery.execute();
    const isHealthy = result.database.status === 'healthy';
    const statusCode = isHealthy ? 200 : 503;
    return reply.status(statusCode).send({
      success: true,
      message: isHealthy ? 'All systems healthy.' : 'Some systems are unhealthy.',
      data: result,
    });
  },

  async databaseHealth(_request: FastifyRequest, reply: FastifyReply) {
    const result = await databaseHealthQuery.execute();
    return reply.status(200).send(successResponse(result, 'Database health check.'));
  },

  async firebaseHealth(_request: FastifyRequest, reply: FastifyReply) {
    const result = await firebaseHealthQuery.execute();
    return reply.status(200).send(successResponse(result, 'Firebase health check.'));
  },
};
