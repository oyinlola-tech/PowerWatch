import { UserRepository } from '../../../repositories/user.repository.js';

export class GetUserByEmailQuery {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
  ) {}

  async execute(email: string) {
    return this.userRepository.findByEmail(email.toLowerCase().trim());
  }
}
