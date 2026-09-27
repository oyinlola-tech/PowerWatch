import { UserRepository } from '../../../repositories/user.repository.js';

export class GetUserByIdQuery {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
  ) {}

  async execute(id: string) {
    return this.userRepository.findById(id);
  }
}
