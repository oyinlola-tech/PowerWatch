import { getMessenger } from '../messaging.js';

export class SubscribeTopicCommand {
  async execute(token: string, topic: string): Promise<boolean> {
    try {
      const messenger = getMessenger();
      await messenger.subscribeToTopic(token, topic);
      return true;
    } catch (error) {
      console.error('Firebase subscribe to topic failed:', error);
      return false;
    }
  }
}
