import type { FastifyPluginAsync } from 'fastify';
import { GetLatestReleaseQuery } from '../services/app/latestRelease.query.js';
import { successResponse } from '../utils/response.js';

const getLatestReleaseQuery = new GetLatestReleaseQuery();

export const appRoutes: FastifyPluginAsync = async (app) => {
  app.get('/latest', {
    schema: {
      description:
        'The newest Android app build (APK) published on GitHub Releases, for the landing page download ' +
        'button and the in-app update prompt. 404 until the first release is published. minimumVersion, ' +
        'when set, means older versions must update.',
      tags: ['App'],
      summary: 'Latest Android release',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                platform: { type: 'string', enum: ['android'] },
                version: { type: 'string', example: '1.0.2' },
                downloadUrl: { type: 'string' },
                fileName: { type: 'string' },
                sizeBytes: { type: 'integer' },
                publishedAt: { type: 'string' },
                notes: { type: 'string' },
                releasePage: { type: 'string' },
                minimumVersion: { type: 'string', nullable: true },
              },
            },
          },
        },
      },
    },
  }, async (_request, reply) => {
    const release = await getLatestReleaseQuery.execute();
    // Short browser/CDN caching is fine for this public, non-personal answer
    reply.header('cache-control', 'public, max-age=300');
    return reply.status(200).send(successResponse(release, 'Latest release.'));
  });
};
