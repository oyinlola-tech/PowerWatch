import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';
import { UserRepository } from '../../../repositories/user.repository.js';
import { AuditRepository } from '../../../repositories/audit.repository.js';
import { goodbyeEmail, sendAccountEmail } from '../../mail/templates/account.js';
import { type AdminActor, assertCanModifyUser } from './adminActor.js';

export class DeleteUserCommand {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly auditRepository: AuditRepository = new AuditRepository(),
  ) {}

  async execute(userId: string, actor: AdminActor) {
    const user = await this.userRepository.findByIdWithFull(userId);
    if (!user) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }
    assertCanModifyUser(actor, user);

    const wasActive = !user.deletedAt;
    await this.userRepository.anonymizeAndDelete(userId);
    if (wasActive) sendAccountEmail(user.email, goodbyeEmail({ firstName: user.firstName, removedByAdmin: true }));

    await this.auditRepository.create({
      userId: actor.userId,
      action: 'ADMIN_ACTION',
      entityType: 'User',
      entityId: userId,
      // No email here: the account's personal data has just been erased
      metadata: { operation: 'DELETE_USER' },
      ipAddress: actor.ipAddress ?? null,
      userAgent: actor.userAgent ?? null,
    });
  }
}
