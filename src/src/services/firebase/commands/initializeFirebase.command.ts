import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import type { App } from 'firebase-admin/app';
import { env } from '../../../configs/env.config.js';

let initialized = false;

export class InitializeFirebaseCommand {
  execute(): App {
    if (initialized && getApps().length > 0) {
      return getApp();
    }

    if (!env.firebase.projectId || !env.firebase.privateKey || !env.firebase.clientEmail) {
      console.warn('Firebase credentials not configured. Push notifications disabled.');
      initialized = true;
      return initializeApp({ projectId: 'placeholder' });
    }

    const app = initializeApp({
      credential: cert({
        projectId: env.firebase.projectId,
        privateKey: env.firebase.privateKey.replace(/\\n/g, '\n'),
        clientEmail: env.firebase.clientEmail,
      }),
    });

    initialized = true;
    return app;
  }
}

export function getFirebaseApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }
  return new InitializeFirebaseCommand().execute();
}
