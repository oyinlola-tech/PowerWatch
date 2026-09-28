import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { prisma } from '../../../configs/database.config.js';
import { env } from '../../../configs/env.config.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';
import { POWER_MESSAGES } from '../../../constants/power.constant.js';
import { ReverseGeocodeQuery } from '../../locations/queries/reverseGeocode.query.js';
import { LocationRepository } from '../../../repositories/location.repository.js';
import { sendAccountEmail, welcomeEmail } from '../../mail/templates/account.js';
import { verifyGoogleIdToken } from '../google.js';
import { issueSession } from '../issueSession.js';

export const TERMS_REQUIRED = 'TERMS_REQUIRED';

export interface GoogleSignInDto {
  idToken: string;
  /** Needed only when this Google account has no PowerWatch account yet */
  acceptedTerms?: boolean | undefined;
  termsVersion?: string | undefined;
  deviceType?: 'ANDROID' | 'IOS' | 'WEB' | undefined;
  deviceName?: string | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
  mocked?: boolean | undefined;
}

/**
 * Signs in with Google. The Google account is matched by its Google ID, then by verified
 * email (linking an existing email/password account). A new account needs the person to
 * have agreed to the Terms; without that the API answers 409 with TERMS_REQUIRED so the app
 * can ask and try again.
 */
export class GoogleSignInCommand {
  constructor(
    private readonly reverseGeocodeQuery: ReverseGeocodeQuery = new ReverseGeocodeQuery(),
    private readonly locationRepository: LocationRepository = new LocationRepository(),
  ) {}

  async execute(dto: GoogleSignInDto, ipAddress?: string, userAgent?: string) {
    const google = await verifyGoogleIdToken(dto.idToken);

    let user =
      (await prisma.user.findFirst({ where: { googleId: google.googleId }, orderBy: { createdAt: 'asc' } })) ??
      (await prisma.user.findFirst({ where: { email: google.email, deletedAt: null } }));

    let created = false;
    if (user) {
      if (user.deletedAt) throw new AppError(401, MESSAGES.INVALID_CREDENTIALS);
      if (user.suspendedAt) throw new AppError(403, MESSAGES.ACCOUNT_SUSPENDED);
      if (!user.googleId || !user.emailVerified) {
        // Google has confirmed this address belongs to the person signing in
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: google.googleId, emailVerified: true },
        });
      }
    } else {
      if (dto.acceptedTerms !== true) {
        throw new AppError(409, TERMS_REQUIRED, [
          { field: 'acceptedTerms', message: 'You must agree to the Terms & Conditions and Privacy Policy.' },
        ]);
      }
      user = await this.createUser(google, dto);
      created = true;
    }

    const session = await issueSession(user, { ipAddress, userAgent, method: 'GOOGLE' });
    if (created) sendAccountEmail(user.email, welcomeEmail({ firstName: user.firstName }));
    return { ...session, isNewUser: created };
  }

  private async createUser(google: Awaited<ReturnType<typeof verifyGoogleIdToken>>, dto: GoogleSignInDto) {
    let place: Record<string, number | null> = {};
    let point: { latitude: number; longitude: number } | null = null;
    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      if (dto.mocked) throw new AppError(422, POWER_MESSAGES.LOCATION_MOCKED);
      const geo = await this.reverseGeocodeQuery.execute(dto.latitude, dto.longitude).catch((error) => {
        if (error instanceof AppError) throw error;
        return null;
      });
      if (geo) {
        const street = await this.locationRepository.findOrCreateStreet(geo.neighborhoodId, geo.road);
        place = {
          countryId: geo.countryId,
          stateId: geo.stateId,
          lgaId: geo.lgaId,
          cityId: geo.cityId,
          townId: geo.townId,
          neighborhoodId: geo.neighborhoodId,
          streetId: street?.id ?? null,
        };
        point = { latitude: dto.latitude, longitude: dto.longitude };
      }
    }

    return prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        firstName: google.firstName,
        lastName: google.lastName,
        email: google.email,
        googleId: google.googleId,
        // No password until the person sets one through "Forgot password"
        passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), env.bcrypt.saltRounds),
        passwordSet: false,
        emailVerified: true,
        termsAcceptedAt: new Date(),
        termsVersion: dto.termsVersion ?? null,
        ...place,
        ...(point ?? {}),
        ...(dto.deviceType || dto.deviceName
          ? {
              devices: {
                create: {
                  id: crypto.randomUUID(),
                  deviceType: dto.deviceType ?? null,
                  deviceName: dto.deviceName ?? null,
                },
              },
            }
          : {}),
      },
    });
  }
}
