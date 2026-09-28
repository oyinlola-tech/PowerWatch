import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../../../configs/env.config.js';

export class MailService {
  private transporter: Transporter | null = null;
  private readonly fromAddress: string;
  private readonly fromName: string;

  constructor() {
    this.fromAddress = env.smtp.fromEmail;
    this.fromName = env.smtp.fromName;

    if (this.canSend()) {
      this.transporter = nodemailer.createTransport({
        host: env.smtp.host,
        port: env.smtp.port,
        secure: env.smtp.secure,
        auth: {
          user: env.smtp.user,
          pass: env.smtp.pass,
        },
      });
    }
  }

  private canSend() {
    return Boolean(
      env.smtp.host &&
        env.smtp.user &&
        env.smtp.pass &&
        env.smtp.fromEmail,
    );
  }

  async sendMail({
    to,
    subject,
    text,
    html,
  }: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }) {
    if (!this.canSend() || !this.transporter) {
      // NODE_ENV must be set to "development" on purpose: an unset value also reads as
      // development, and a live server started without it must not log codes.
      if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
        // Never write message bodies (which can contain OTPs) to production logs.
        console.error(`SMTP is not configured. Email "${subject}" was not sent.`);
        return;
      }
      console.log(`[DEV] SMTP is not configured. Email to ${to} not sent. Subject: ${subject}\n${text}`);
      return;
    }

    await this.transporter.sendMail({
      from: `${this.fromName} <${this.fromAddress}>`,
      to,
      subject,
      text,
      html,
    });
  }
}
