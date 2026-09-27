import { getMessaging } from 'firebase-admin/messaging';
import type { Messaging } from 'firebase-admin/messaging';
import { getFirebaseApp } from './commands/initializeFirebase.command.js';

let messenger: Messaging | null = null;

export function getMessenger(): Messaging {
  if (!messenger) {
    getFirebaseApp();
    messenger = getMessaging();
  }
  return messenger;
}
