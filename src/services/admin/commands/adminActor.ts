import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';

/** The admin performing an action, for authorization checks and the audit trail. */
export interface AdminActor {
  userId: string;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

/** Admins may not act on themselves or on other admins (prevents lock-out and privilege fights). */
export function assertCanModifyUser(actor: AdminActor, target: { id: string; role: string }) {
  if (target.id === actor.userId) {
    throw new AppError(403, MESSAGES.CANNOT_MODIFY_SELF);
  }
  if (target.role === 'ADMIN') {
    throw new AppError(403, MESSAGES.CANNOT_MODIFY_ADMIN);
  }
}
