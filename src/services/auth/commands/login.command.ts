import bcrypt from 'bcryptjs';
import { UserRepository } from '../../../repositories/user.repository.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';
import { issueSession } from '../issueSession.js';

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

const DUMMY_HASH = bcrypt.hashSync('powerwatch-timing-equaliser', 12);

export class LoginCommand {
  constructor(private readonly userRepository: UserRepository = new UserRepository()) {}

  async execute(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResult> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const user = await this.userRepository.findByEmailWithPassword(normalizedEmail);
    if (!user) {
      // Same work as a real check, so the response time doesn't reveal which emails exist
      await bcrypt.compare(dto.password, DUMMY_HASH);
      throw new AppError(401, MESSAGES.INVALID_CREDENTIALS);
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, MESSAGES.INVALID_CREDENTIALS);
    }

    if (user.suspendedAt) {
      throw new AppError(403, MESSAGES.ACCOUNT_SUSPENDED);
    }

    return issueSession(user, { ipAddress, userAgent });
  }
}
