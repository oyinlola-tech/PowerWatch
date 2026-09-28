import bcrypt from 'bcryptjs';
import { UserRepository } from '../../../repositories/user.repository.js';
import { AuditRepository } from '../../../repositories/audit.repository.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';
import { verifyGoogleIdToken } from '../google.js';

const NO_PASSWORD_MESSAGE =
  'This account signs in with Google and has no password. Confirm with Google instead.';
import { goodbyeEmail, sendAccountEmail } from '../../mail/templates/account.js';

export class DeleteAccountCommand {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly auditRepository: AuditRepository = new AuditRepository(),
  ) {}

  async execute(
    userId: string,
    confirmation: { password?: string | undefined; googleIdToken?: string | undefined },
  ) {
    const user = await this.userRepository.findByIdWithFull(userId);
    if (!user || user.deletedAt) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    if (confirmation.password) {
      const valid = await bcrypt.compare(confirmation.password, user.passwordHash);
      if (!valid) {
        throw new AppError(400, user.passwordSet ? 'Password is incorrect.' : NO_PASSWORD_MESSAGE);
      }
    } else if (confirmation.googleIdToken) {
      const google = await verifyGoogleIdToken(confirmation.googleIdToken);
      if (!user.googleId || google.googleId !== user.googleId) {
        throw new AppError(400, 'That Google account is not linked to this PowerWatch account.');
      }
    }

    await this.userRepository.anonymizeAndDelete(userId);
    sendAccountEmail(user.email, goodbyeEmail({ firstName: user.firstName }));

    // Records that the deletion happened, without the IP address or device of the person who left
    await this.auditRepository.create({
      userId,
      action: 'ACCOUNT_DELETE',
      entityType: 'User',
      entityId: userId,
    });

    return { message: 'Account deleted successfully.' };
  }
}
