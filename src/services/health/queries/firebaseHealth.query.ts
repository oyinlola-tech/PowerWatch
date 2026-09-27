import { getApps } from 'firebase-admin/app';
import { getFirebaseApp } from '../../firebase/commands/initializeFirebase.command.js';

export class FirebaseHealthQuery {
  async execute() {
    try {
      getFirebaseApp();
      if (getApps().length === 0) {
        return {
          status: 'unhealthy',
          message: 'Firebase not initialized',
          timestamp: new Date().toISOString(),
        };
      }
      return {
        status: 'healthy' as const,
        projectId: getApps()[0]?.options.projectId ?? 'unknown',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy' as const,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
