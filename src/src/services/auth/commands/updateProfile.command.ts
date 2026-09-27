import { UserRepository } from '../../../repositories/user.repository.js';
import { AuditRepository } from '../../../repositories/audit.repository.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';

export class UpdateProfileCommand {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly auditRepository: AuditRepository = new AuditRepository(),
  ) {}

  async execute(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      notificationEnabled?: boolean;
      latitude?: number | null;
      longitude?: number | null;
      neighborhoodId?: number | null;
    },
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    const cleaned: Record<string, unknown> = {};
    if (data.firstName !== undefined) cleaned.firstName = data.firstName;
    if (data.lastName !== undefined) cleaned.lastName = data.lastName;
    if (data.notificationEnabled !== undefined) cleaned.notificationEnabled = data.notificationEnabled;
    if (data.latitude !== undefined) cleaned.latitude = data.latitude;
    if (data.longitude !== undefined) cleaned.longitude = data.longitude;
    if (data.neighborhoodId !== undefined) cleaned.neighborhoodId = data.neighborhoodId;

    const updated = await this.userRepository.updateProfile(userId, cleaned as Parameters<typeof this.userRepository.updateProfile>[1]);

    await this.auditRepository.create({
      userId,
      action: 'PROFILE_UPDATE',
      entityType: 'User',
      entityId: userId,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    });

    return updated;
  }
}
