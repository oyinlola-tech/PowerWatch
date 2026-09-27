import { UserRepository } from '../../../repositories/user.repository.js';
import { AuditRepository } from '../../../repositories/audit.repository.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';
import { prisma } from '../../../configs/database.config.js';

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
    if (data.neighborhoodId === null) {
      Object.assign(cleaned, {
        countryId: null, stateId: null, lgaId: null, cityId: null, townId: null, neighborhoodId: null,
      });
    } else if (data.neighborhoodId !== undefined) {
      // Keep the whole hierarchy consistent with the chosen neighborhood.
      const neighborhood = await prisma.neighborhood.findUnique({
        where: { id: data.neighborhoodId },
        select: {
          id: true,
          town: { select: { id: true, city: { select: { id: true, lga: { select: { id: true, state: { select: { id: true, countryId: true } } } } } } } },
        },
      });
      if (!neighborhood) {
        throw new AppError(422, MESSAGES.NEIGHBORHOOD_UNKNOWN, [
          { field: 'neighborhoodId', message: `Neighborhood with ID ${data.neighborhoodId} not found.` },
        ]);
      }
      const { town } = neighborhood;
      Object.assign(cleaned, {
        neighborhoodId: neighborhood.id,
        townId: town.id,
        cityId: town.city.id,
        lgaId: town.city.lga.id,
        stateId: town.city.lga.state.id,
        countryId: town.city.lga.state.countryId,
      });
    }

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
