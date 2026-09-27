import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';
import { env } from './configs/env.config.js';
import { prisma } from './configs/database.config.js';
import { ensureDatabaseExists } from './loaders/database.loader.js';
import { seedAdmin } from './loaders/seed.loader.js';
import { backfillLocationCoordinates } from './loaders/locationCoordinates.loader.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

async function generatePrismaClient() {
  // npm scripts run from the package root, both for `tsx server.ts` and `node dist/server.js`.
  const generatedClient = path.join(process.cwd(), 'node_modules/.prisma/client/default.js');
  if (!existsSync(generatedClient)) {
    console.log('Prisma client not found. Generating...');
    execSync('npx prisma generate', { stdio: 'inherit' });
  }
}

function registerShutdownHandlers(app: FastifyInstance) {
  let shuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;
    app.log.info({ signal }, 'Shutting down gracefully...');

    const forceExit = setTimeout(() => {
      app.log.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    try {
      // Stops accepting connections and waits for in-flight requests to finish.
      await app.close();
      await prisma.$disconnect();
      app.log.info('Shutdown complete.');
      process.exit(0);
    } catch (err) {
      app.log.error({ err }, 'Error during shutdown.');
      process.exit(1);
    }
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

async function main() {
  await generatePrismaClient();

  await ensureDatabaseExists();

  // Sync the database directly from prisma/schema.prisma (no SQL migration files).
  // Without --accept-data-loss, Prisma refuses changes that would drop data, so a
  // destructive schema edit stops startup instead of silently deleting anything.
  console.log('Syncing database schema...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  await prisma.$connect();
  console.log('Database connected successfully.');

  await seedAdmin();
  await backfillLocationCoordinates();

  const app = await buildApp();
  registerShutdownHandlers(app);

  await app.listen({ port: env.port, host: env.host });

  const address = app.server.address();
  const host = address ? (typeof address === 'string' ? address : address.address) : env.host;
  const port = address ? (typeof address === 'string' ? env.port : address.port) : env.port;
  console.log(`Server running at http://${host}:${port}`);
  if (env.nodeEnv !== 'production') {
    console.log(`Swagger documentation at http://${host}:${port}/docs`);
  }
}

main().catch(async (err) => {
  console.error('Failed to start server:', err);
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
