import { DatabaseHealthQuery } from './databaseHealth.query.js';
import { FirebaseHealthQuery } from './firebaseHealth.query.js';

export class HealthCheckQuery {
  constructor(
    private readonly databaseHealth: DatabaseHealthQuery = new DatabaseHealthQuery(),
    private readonly firebaseHealth: FirebaseHealthQuery = new FirebaseHealthQuery(),
  ) {}

  async execute() {
    const [db, firebase] = await Promise.all([
      this.databaseHealth.execute(),
      this.firebaseHealth.execute(),
    ]);

    return {
      server: {
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
      database: db,
      firebase,
    };
  }
}
