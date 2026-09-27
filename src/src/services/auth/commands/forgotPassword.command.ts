import { AppError } from '../../../errors/index.js';
import { UserRepository } from '../../../repositories/user.repository.js';
import { SendOtpCommand } from './sendOtp.command.js';

export class ForgotPasswordCommand {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly sendOtpCommand: SendOtpCommand = new SendOtpCommand(),
  ) {}

  async execute(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      return;
    }

    await this.sendOtpCommand.execute(normalizedEmail, 'PASSWORD_RESET');
  }
}
