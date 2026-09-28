import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { prisma } from '../configs/database.config.js';
import { env } from '../configs/env.config.js';
import { passwordSchema } from '../validators/auth.validator.js';
import { sendAccountEmail, welcomeEmail } from '../services/mail/templates/account.js';

export async function seedAdmin(): Promise<void> {
  if (!env.admin.email) {
    console.log('No admin credentials configured. Skipping admin seed.');
    return;
  }

  const normalizedEmail = env.admin.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (existing) {
    console.log('Admin user already exists. Skipping seed.');
    return;
  }

  const passwordCheck = passwordSchema.safeParse(env.admin.password);
  if (!passwordCheck.success) {
    throw new Error(
      `ADMIN_EMAIL is set but ADMIN_PASSWORD is not strong enough: ${passwordCheck.error.issues[0]?.message}`,
    );
  }

  const passwordHash = await bcrypt.hash(env.admin.password, env.bcrypt.saltRounds);

  await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      firstName: env.admin.firstName,
      lastName: env.admin.lastName,
      email: normalizedEmail,
      passwordHash,
      role: 'ADMIN',
      emailVerified: true,
      notificationEnabled: false,
    },
  });

  console.log('Admin user seeded successfully.');
  sendAccountEmail(normalizedEmail, welcomeEmail({ firstName: env.admin.firstName, isAdmin: true }));
}
