import { UserRepository } from '../../../repositories/user.repository.js';

export class CheckEmailExistsQuery {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
  ) {}

  async execute(email: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(email.toLowerCase().trim());
    return user !== null;
  }
}
