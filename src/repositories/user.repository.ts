import crypto from 'node:crypto';
import { prisma } from '../configs/database.config.js';
import { Prisma } from '@prisma/client';
import type { UserResponse } from '../interfaces/index.js';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        emailVerified: true,
        notificationEnabled: true,
        outageAlerts: true,
        restorationAlerts: true,
        communityUpdates: true,
        countryId: true,
        stateId: true,
        lgaId: true,
        cityId: true,
        townId: true,
        neighborhoodId: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByEmailWithPassword(email: string) {
    return prisma.user.findUnique({
      where: { email, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        passwordHash: true,
        role: true,
        emailVerified: true,
        notificationEnabled: true,
        suspendedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        emailVerified: true,
        notificationEnabled: true,
        outageAlerts: true,
        restorationAlerts: true,
        communityUpdates: true,
        countryId: true,
        stateId: true,
        lgaId: true,
        cityId: true,
        townId: true,
        neighborhoodId: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
        country: { select: { id: true, name: true } },
        state: { select: { id: true, name: true } },
        lga: { select: { id: true, name: true } },
        city: { select: { id: true, name: true } },
        town: { select: { id: true, name: true } },
        neighborhood: { select: { id: true, name: true } },
      },
    });
  }

  async findByIdWithFull(id: string) {
    return prisma.user.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  async updatePassword(email: string, passwordHash: string) {
    return prisma.user.update({
      where: { email, deletedAt: null },
      data: { passwordHash, passwordChangedAt: new Date() },
    });
  }

  async updatePasswordById(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash, passwordChangedAt: new Date() },
    });
  }

  async markEmailVerified(email: string) {
    return prisma.user.update({
      where: { email, deletedAt: null },
      data: { emailVerified: true },
    });
  }

  async updateProfile(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      notificationEnabled?: boolean;
      latitude?: number | null;
      longitude?: number | null;
      countryId?: number | null;
      stateId?: number | null;
      lgaId?: number | null;
      cityId?: number | null;
      townId?: number | null;
      neighborhoodId?: number | null;
    },
  ) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        emailVerified: true,
        notificationEnabled: true,
        outageAlerts: true,
        restorationAlerts: true,
        communityUpdates: true,
        countryId: true,
        stateId: true,
        lgaId: true,
        cityId: true,
        townId: true,
        neighborhoodId: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateLastLogin(id: string) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async setSuspended(id: string, suspended: boolean) {
    return prisma.user.update({
      where: { id },
      data: { suspendedAt: suspended ? new Date() : null },
    });
  }

  /**
   * Deletes an account for privacy: removes everything that identifies the person
   * (name, email, password, home location, devices, sessions, saved places,
   * notifications, codes) and strips the GPS point from their reports. Their
   * ON/OFF reports stay, so neighborhood history remains accurate, tied only to
   * an emptied row. Security log entries keep the action and time but lose the
   * IP address, device details and any email held in their metadata.
   */
  async anonymizeAndDelete(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: { email: true } });
    if (!user) return;

    await prisma.$transaction([
      prisma.report.updateMany({
        where: { userId: id },
        // The street can point to someone's home, so it goes with the exact position
        data: { latitude: null, longitude: null, locationAccuracy: null, streetId: null },
      }),
      prisma.savedNeighborhood.deleteMany({ where: { userId: id } }),
      prisma.notificationLog.deleteMany({ where: { userId: id } }),
      prisma.session.deleteMany({ where: { userId: id } }),
      prisma.refreshToken.deleteMany({ where: { userId: id } }),
      prisma.device.deleteMany({ where: { userId: id } }),
      prisma.otp.deleteMany({ where: { email: user.email } }),
      prisma.auditLog.updateMany({
        where: { OR: [{ userId: id }, { entityType: 'User', entityId: id }] },
        data: { ipAddress: null, userAgent: null, metadata: Prisma.DbNull },
      }),
      prisma.user.update({
        where: { id },
        data: {
          firstName: 'Deleted',
          lastName: 'User',
          // Frees the address so the person can sign up again later
          email: `deleted-${id}@deleted.invalid`,
          passwordHash: `deleted:${crypto.randomBytes(32).toString('hex')}`,
          emailVerified: false,
          notificationEnabled: false,
          latitude: null,
          longitude: null,
          countryId: null,
          stateId: null,
          lgaId: null,
          cityId: null,
          townId: null,
          neighborhoodId: null,
          streetId: null,
          deletedAt: new Date(),
        },
      }),
    ]);
  }

  async softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
