import type { TokenMessage, TopicMessage, MulticastMessage } from 'firebase-admin/messaging';
import { getMessenger } from '../messaging.js';
import { describeError, recordSystemEvent } from '../../systemEvents/recordSystemEvent.js';

const FCM_MULTICAST_LIMIT = 500;

export class SendFirebaseNotificationCommand {
  async execute(payload: {
    token?: string;
    topic?: string;
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<string | null> {
    try {
      const messenger = getMessenger();
      const notification = { title: payload.title, body: payload.body };

      let response: string;

      if (payload.token) {
        const message: TokenMessage = {
          token: payload.token,
          notification,
          ...(payload.data ? { data: payload.data } : {}),
        };
        response = await messenger.send(message);
      } else if (payload.topic) {
        const message: TopicMessage = {
          topic: payload.topic,
          notification,
          ...(payload.data ? { data: payload.data } : {}),
        };
        response = await messenger.send(message);
      } else {
        throw new Error('Either token or topic is required.');
      }

      return response;
    } catch (error) {
      console.error('Firebase send notification failed:', error);
      return null;
    }
  }

  async sendMulticast(payload: {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<{ successCount: number; failureCount: number }> {
    let messenger;
    try {
      messenger = getMessenger();
    } catch (error) {
      await recordSystemEvent({
        level: 'ERROR',
        source: 'push',
        message: 'Firebase is not available for push notifications.',
        details: describeError(error),
      });
      return { successCount: 0, failureCount: payload.tokens.length };
    }

    let successCount = 0;
    let failureCount = 0;

    // FCM accepts at most 500 tokens per multicast request.
    for (let i = 0; i < payload.tokens.length; i += FCM_MULTICAST_LIMIT) {
      const tokens = payload.tokens.slice(i, i + FCM_MULTICAST_LIMIT);
      try {
        const message: MulticastMessage = {
          tokens,
          notification: { title: payload.title, body: payload.body },
          ...(payload.data ? { data: payload.data } : {}),
        };

        const response = await messenger.sendEachForMulticast(message);
        successCount += response.successCount;
        failureCount += response.failureCount;
      } catch (error) {
        await recordSystemEvent({
          level: 'ERROR',
          source: 'push',
          message: 'Firebase push notifications could not be sent.',
          details: { messages: tokens.length, ...describeError(error) },
        });
        failureCount += tokens.length;
      }
    }

    return { successCount, failureCount };
  }
}
