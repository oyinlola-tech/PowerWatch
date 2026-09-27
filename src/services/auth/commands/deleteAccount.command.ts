import bcrypt from 'bcryptjs';
import { UserRepository } from '../../../repositories/user.repository.js';
import { AuditRepository } from '../../../repositories/audit.repository.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';

export class DeleteAccountCommand {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly auditRepository: AuditRepository = new AuditRepository(),
  ) {}

  async execute(
    userId: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.userRepository.findByIdWithFull(userId);
    if (!user || user.deletedAt) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError(400, 'Password is incorrect.');
    }

    await this.userRepository.anonymizeAndDelete(userId);

    await this.auditRepository.create({
      userId,
      action: 'ACCOUNT_DELETE',
      entityType: 'User',
      entityId: userId,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    });

    return { message: 'Account deleted successfully.' };
  }
}
