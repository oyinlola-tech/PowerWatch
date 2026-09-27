import { getMessenger } from '../messaging.js';

export class UnsubscribeTopicCommand {
  async execute(token: string, topic: string): Promise<boolean> {
    try {
      const messenger = getMessenger();
      await messenger.unsubscribeFromTopic(token, topic);
      return true;
    } catch (error) {
      console.error('Firebase unsubscribe from topic failed:', error);
      return false;
    }
  }
}
