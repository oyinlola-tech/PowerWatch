import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { env } from './env.config.js';

const adapter = new PrismaMariaDb({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
});

export const prisma = new PrismaClient({
  adapter,
  log: env.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
