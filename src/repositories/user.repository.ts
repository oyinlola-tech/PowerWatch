import { prisma } from '../configs/database.config.js';
import type { Prisma } from '@prisma/client';
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

  async softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
