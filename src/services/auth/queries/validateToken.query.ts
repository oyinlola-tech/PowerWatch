import { verifyAccessToken } from '../../../configs/jwt.config.js';

export class ValidateTokenQuery {
  async execute(token: string): Promise<{ userId: string; role: string } | null> {
    try {
      const payload = verifyAccessToken(token);
      return { userId: payload.userId, role: payload.role };
    } catch {
      return null;
    }
  }
}
