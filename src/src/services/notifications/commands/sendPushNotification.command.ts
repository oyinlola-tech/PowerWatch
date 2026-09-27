import { NotificationRepository } from '../../../repositories/notification.repository.js';
import { UserRepository } from '../../../repositories/user.repository.js';
import { SendFirebaseNotificationCommand } from '../../firebase/commands/sendNotification.command.js';
import type { CreateNotificationDto } from '../../../interfaces/index.js';

export class SendPushNotificationCommand {
  constructor(
    private readonly notificationRepository: NotificationRepository = new NotificationRepository(),
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly firebaseSender: SendFirebaseNotificationCommand = new SendFirebaseNotificationCommand(),
  ) {}

  async execute(dto: CreateNotificationDto) {
    const notification = await this.notificationRepository.create({
      userId: dto.userId,
      title: dto.title,
      body: dto.body,
      sent: true,
      delivered: false,
      opened: false,
      clicked: false,
      sentAt: new Date(),
    });

    const user = await this.userRepository.findById(dto.userId);
    if (user && user.notificationEnabled) {
      const firebaseResult = await this.firebaseSender.execute({
        topic: `user_${dto.userId}`,
        title: dto.title,
        body: dto.body,
        data: { notificationId: notification.id },
      });

      if (firebaseResult) {
        await this.notificationRepository.update(notification.id, {
          delivered: true,
          deliveredAt: new Date(),
        });
      }
    }

    return notification;
  }
}
