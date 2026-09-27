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
    return user;
  }
}
