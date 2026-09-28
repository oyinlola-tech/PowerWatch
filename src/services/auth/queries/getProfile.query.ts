import { UserRepository } from '../../../repositories/user.repository.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';

export class GetProfileQuery {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }
    // Which ways the person can sign in, without exposing the provider account IDs
    const { googleId, appleId, ...profile } = user;
    return { ...profile, signInMethods: { google: googleId !== null, apple: appleId !== null } };
  }
}
