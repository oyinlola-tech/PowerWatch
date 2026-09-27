import mysql from 'mysql2/promise';
import { env } from '../configs/env.config.js';

const SAFE_DB_NAME = /^[A-Za-z0-9_$]{1,64}$/;

export async function ensureDatabaseExists(): Promise<void> {
  if (!SAFE_DB_NAME.test(env.db.name)) {
    throw new Error(`DB_NAME "${env.db.name}" contains unsupported characters.`);
  }

  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  } finally {
    await connection.end();
  }

  console.log(`Database "${env.db.name}" ensured.`);
}
