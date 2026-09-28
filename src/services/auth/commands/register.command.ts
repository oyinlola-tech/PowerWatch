import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import type { RegisterDto, RegisterResult } from '../../../interfaces/index.js';
import { UserRepository } from '../../../repositories/user.repository.js';
import { LocationRepository } from '../../../repositories/location.repository.js';
import { AuthRepository } from '../../../repositories/auth.repository.js';
import { AuditRepository } from '../../../repositories/audit.repository.js';
import { POWER_MESSAGES } from '../../../constants/power.constant.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';
import { prisma } from '../../../configs/database.config.js';
import { signAccessToken, signRefreshToken, getRefreshTokenExpiryDate } from '../../../configs/jwt.config.js';
import { env } from '../../../configs/env.config.js';
import { ReverseGeocodeQuery } from '../../locations/queries/reverseGeocode.query.js';
import { SendOtpCommand } from './sendOtp.command.js';

export class RegisterCommand {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly locationRepository: LocationRepository = new LocationRepository(),
    private readonly authRepository: AuthRepository = new AuthRepository(),
    private readonly auditRepository: AuditRepository = new AuditRepository(),
    private readonly reverseGeocodeQuery: ReverseGeocodeQuery = new ReverseGeocodeQuery(),
    private readonly sendOtpCommand: SendOtpCommand = new SendOtpCommand(),
  ) {}

  async execute(
    dto: RegisterDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<RegisterResult> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new AppError(409, MESSAGES.EMAIL_EXISTS);
    }

    const hasFullHierarchy =
      dto.stateId !== undefined &&
      dto.lgaId !== undefined &&
      dto.cityId !== undefined &&
      dto.townId !== undefined &&
      dto.neighborhoodId !== undefined;

    let countryId = dto.countryId;
    let stateId: number | undefined;
    let lgaId: number | undefined;
    let cityId: number | undefined;
    let townId: number | undefined;
    let neighborhoodId: number | undefined;
    let streetId: number | undefined;
    let latitude: number | undefined;
    let longitude: number | undefined;

    if (hasFullHierarchy) {
      stateId = dto.stateId;
      lgaId = dto.lgaId;
      cityId = dto.cityId;
      townId = dto.townId;
      neighborhoodId = dto.neighborhoodId;
      latitude = dto.latitude;
      longitude = dto.longitude;

      if (!countryId) {
        const country = await this.locationRepository.findCountryById(1);
        if (country) countryId = country.id;
      }

      if (!countryId) {
        throw new AppError(422, 'Country not found.', [
          { field: 'countryId', message: 'Default country not found.' },
        ]);
      }

      const state = await this.locationRepository.findStateById(stateId!);
      if (!state) {
        throw new AppError(422, MESSAGES.STATE_NOT_FOUND, [
          { field: 'stateId', message: `State with ID ${stateId} not found.` },
        ]);
      }

      const lga = await this.locationRepository.findLgaById(lgaId!);
      if (!lga || lga.stateId !== stateId) {
        throw new AppError(422, MESSAGES.LGA_NOT_FOUND, [
          { field: 'lgaId', message: `LGA with ID ${lgaId} not found under the given state.` },
        ]);
      }

      const city = await this.locationRepository.findCityById(cityId!);
      if (!city || city.lgaId !== lgaId) {
        throw new AppError(422, MESSAGES.CITY_NOT_FOUND, [
          { field: 'cityId', message: `City with ID ${cityId} not found under the given LGA.` },
        ]);
      }

      const town = await this.locationRepository.findTownById(townId!);
      if (!town || town.cityId !== cityId) {
        throw new AppError(422, MESSAGES.TOWN_NOT_FOUND, [
          { field: 'townId', message: `Town with ID ${townId} not found under the given city.` },
        ]);
      }

      const neighborhood = await this.locationRepository.findNeighborhoodById(neighborhoodId!);
      if (!neighborhood || neighborhood.townId !== townId) {
        throw new AppError(422, MESSAGES.NEIGHBORHOOD_NOT_FOUND, [
          {
            field: 'neighborhoodId',
            message: `Neighborhood with ID ${neighborhoodId} not found under the given town.`,
          },
        ]);
      }
    } else if (dto.latitude !== undefined && dto.longitude !== undefined) {
      if (dto.mocked) {
        throw new AppError(422, POWER_MESSAGES.LOCATION_MOCKED, [{ field: 'mocked', message: POWER_MESSAGES.LOCATION_MOCKED }]);
      }
      // The GPS point sets the home area. If the lookup service is down, the account is still
      // created and the app asks for the location again on the next screen.
      const geo = await this.reverseGeocodeQuery.execute(dto.latitude, dto.longitude).catch((error) => {
        if (error instanceof AppError) throw error;
        console.error('Reverse geocoding at registration failed:', error);
        return null;
      });
      if (geo) {
        countryId = geo.countryId;
        stateId = geo.stateId;
        lgaId = geo.lgaId;
        cityId = geo.cityId;
        townId = geo.townId;
        neighborhoodId = geo.neighborhoodId;
        streetId = (await this.locationRepository.findOrCreateStreet(geo.neighborhoodId, geo.road))?.id;
        latitude = dto.latitude;
        longitude = dto.longitude;
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, env.bcrypt.saltRounds);

    const userId = crypto.randomUUID();
    const tokenId = crypto.randomUUID();
    const refreshTokenRaw = crypto.randomUUID();
    const refreshTokenExpiresAt = getRefreshTokenExpiryDate();
    const sessionId = crypto.randomUUID();

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          id: userId,
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: normalizedEmail,
          passwordHash,
          role: 'USER',
          emailVerified: false,
          notificationEnabled: dto.notificationEnabled ?? true,
          countryId: countryId ?? null,
          stateId: stateId ?? null,
          lgaId: lgaId ?? null,
          cityId: cityId ?? null,
          townId: townId ?? null,
          neighborhoodId: neighborhoodId ?? null,
          streetId: streetId ?? null,
          latitude: latitude ?? null,
          longitude: longitude ?? null,
          termsAcceptedAt: new Date(),
          termsVersion: dto.termsVersion ?? null,
        },
      });

      await tx.refreshToken.create({
        data: {
          id: tokenId,
          token: refreshTokenRaw,
          userId: created.id,
          expiresAt: refreshTokenExpiresAt,
        },
      });

      await tx.session.create({
        data: {
          id: sessionId,
          userId: created.id,
          refreshTokenId: tokenId,
          ipAddress: ipAddress ?? null,
          userAgent: userAgent ?? null,
          expiresAt: refreshTokenExpiresAt,
        },
      });

      if (dto.deviceName || dto.deviceType) {
        await tx.device.create({
          data: {
            id: crypto.randomUUID(),
            userId: created.id,
            deviceName: dto.deviceName ?? null,
            deviceType: dto.deviceType ?? null,
          },
        });
      }

      return created;
    }).catch((error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = (error.meta as { target?: string[] } | undefined)?.target;
          const isEmailConflict = target?.includes('email');
          throw new AppError(
            409,
            isEmailConflict ? MESSAGES.EMAIL_EXISTS : 'A unique constraint conflict occurred.',
          );
        }
      }
      throw error;
    });

    await this.auditRepository.create({
      userId: user.id,
      action: 'REGISTER',
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    });

    // Send the verification code right away; a mail failure must not fail the sign-up
    // (the app can call resend-otp).
    let verificationEmailSent = true;
    try {
      await this.sendOtpCommand.execute(normalizedEmail, 'EMAIL_VERIFICATION');
    } catch (error) {
      verificationEmailSent = false;
      console.error('Sending the verification code after registration failed:', error);
    }

    const accessToken = signAccessToken({
      userId: user.id,
      role: user.role,
      sessionId,
    });

    const refreshTokenJwt = signRefreshToken({
      userId: user.id,
      tokenId,
    });

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      accessToken,
      refreshToken: refreshTokenJwt,
      verificationEmailSent,
    };
  }
}
