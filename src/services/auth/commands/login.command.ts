import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { UserRepository } from '../../../repositories/user.repository.js';
import { AuthRepository } from '../../../repositories/auth.repository.js';
import { SessionRepository } from '../../../repositories/session.repository.js';
import { AuditRepository } from '../../../repositories/audit.repository.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';
import { signAccessToken, signRefreshToken, getRefreshTokenExpiryDate } from '../../../configs/jwt.config.js';

interface LoginDto {
  email: string;
  password: string;
}

interface LoginResult {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    emailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export class LoginCommand {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly authRepository: AuthRepository = new AuthRepository(),
    private readonly sessionRepository: SessionRepository = new SessionRepository(),
    private readonly auditRepository: AuditRepository = new AuditRepository(),
  ) {}

  async execute(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResult> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const user = await this.userRepository.findByEmailWithPassword(normalizedEmail);
    if (!user) {
      throw new AppError(401, MESSAGES.INVALID_CREDENTIALS);
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, MESSAGES.INVALID_CREDENTIALS);
    }

    if (user.suspendedAt) {
      throw new AppError(403, MESSAGES.ACCOUNT_SUSPENDED);
    }

    const tokenId = crypto.randomUUID();
    const refreshTokenRaw = crypto.randomUUID();
    const refreshTokenExpiry = getRefreshTokenExpiryDate();

    await this.authRepository.createRefreshToken({
      id: tokenId,
      token: refreshTokenRaw,
      userId: user.id,
      expiresAt: refreshTokenExpiry,
    });

    const sessionId = crypto.randomUUID();
    await this.sessionRepository.create({
      id: sessionId,
      userId: user.id,
      refreshTokenId: tokenId,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      expiresAt: refreshTokenExpiry,
    });

    await this.userRepository.updateLastLogin(user.id);

    await this.auditRepository.create({
      userId: user.id,
      action: 'LOGIN',
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    });

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshTokenJwt = signRefreshToken({ userId: user.id, tokenId });

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
    };
  }
}
