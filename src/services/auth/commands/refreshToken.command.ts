import crypto from 'node:crypto';
import { AppError } from '../../../errors/index.js';
import { AuthRepository } from '../../../repositories/auth.repository.js';
import { SessionRepository } from '../../../repositories/session.repository.js';
import { UserRepository } from '../../../repositories/user.repository.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken, getRefreshTokenExpiryDate } from '../../../configs/jwt.config.js';
import { MESSAGES } from '../../../constants/message.constant.js';

export class RefreshTokenCommand {
  constructor(
    private readonly authRepository: AuthRepository = new AuthRepository(),
    private readonly sessionRepository: SessionRepository = new SessionRepository(),
    private readonly userRepository: UserRepository = new UserRepository(),
  ) {}

  async execute(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(401, MESSAGES.INVALID_REFRESH_TOKEN);
    }

    const storedToken = await this.authRepository.findRefreshTokenById(payload.tokenId);
    if (
      !storedToken ||
      storedToken.userId !== payload.userId ||
      storedToken.revokedAt ||
      storedToken.expiresAt <= new Date()
    ) {
      throw new AppError(401, MESSAGES.INVALID_REFRESH_TOKEN);
    }

    const session = await this.sessionRepository.findByRefreshTokenId(storedToken.id);
    if (!session || !session.isActive || session.deletedAt) {
      throw new AppError(401, MESSAGES.INVALID_REFRESH_TOKEN);
    }

    const user = await this.userRepository.findByIdWithFull(payload.userId);
    if (!user) {
      throw new AppError(401, MESSAGES.INVALID_REFRESH_TOKEN);
    }
    if (user.suspendedAt) {
      throw new AppError(403, MESSAGES.ACCOUNT_SUSPENDED);
    }

    const newTokenId = crypto.randomUUID();
    await this.authRepository.rotateRefreshToken(storedToken.id, {
      id: newTokenId,
      token: crypto.randomUUID(),
      userId: user.id,
      expiresAt: getRefreshTokenExpiryDate(),
    });

    const accessToken = signAccessToken({ userId: user.id, role: user.role, sessionId: session.id });
    const refreshTokenJwt = signRefreshToken({ userId: user.id, tokenId: newTokenId });

    return {
      accessToken,
      refreshToken: refreshTokenJwt,
    };
  }
}
