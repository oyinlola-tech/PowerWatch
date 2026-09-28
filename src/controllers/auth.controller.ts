import type { FastifyRequest, FastifyReply } from 'fastify';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { RegisterCommand } from '../services/auth/commands/register.command.js';
import { LoginCommand } from '../services/auth/commands/login.command.js';
import { LogoutCommand } from '../services/auth/commands/logout.command.js';
import { RefreshTokenCommand } from '../services/auth/commands/refreshToken.command.js';
import { SendOtpCommand } from '../services/auth/commands/sendOtp.command.js';
import { VerifyOtpCommand } from '../services/auth/commands/verifyOtp.command.js';
import { ForgotPasswordCommand } from '../services/auth/commands/forgotPassword.command.js';
import { ResetPasswordCommand } from '../services/auth/commands/resetPassword.command.js';
import { ChangePasswordCommand } from '../services/auth/commands/changePassword.command.js';
import { UpdateFcmTokenCommand } from '../services/auth/commands/updatefcmToken.command.js';
import { UpdateProfileCommand } from '../services/auth/commands/updateProfile.command.js';
import { LogoutAllCommand } from '../services/auth/commands/logoutAll.command.js';
import { DeleteAccountCommand } from '../services/auth/commands/deleteAccount.command.js';
import { ListSessionsQuery, RevokeSessionCommand } from '../services/auth/commands/session.commands.js';
import { ListDevicesQuery, RemoveDeviceCommand } from '../services/auth/commands/device.commands.js';
import { GetProfileQuery } from '../services/auth/queries/getProfile.query.js';
import {
  GetNotificationPreferencesQuery,
  UpdateNotificationPreferencesCommand,
} from '../services/auth/commands/notificationPreferences.commands.js';
import { RegisterPushTokenCommand, UnregisterPushTokenCommand } from '../services/auth/commands/pushToken.commands.js';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  sendOtpSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  updateFcmTokenSchema,
  deleteAccountSchema,
  verifyResetOtpSchema,
  notificationPreferencesSchema,
  registerPushTokenSchema,
  unregisterPushTokenSchema,
} from '../validators/auth.validator.js';
import { successResponse } from '../utils/response.js';
import { MESSAGES } from '../constants/message.constant.js';

const registerCommand = new RegisterCommand();
const loginCommand = new LoginCommand();
const logoutCommand = new LogoutCommand();
const refreshTokenCommand = new RefreshTokenCommand();
const sendOtpCommand = new SendOtpCommand();
const verifyOtpCommand = new VerifyOtpCommand();
const forgotPasswordCommand = new ForgotPasswordCommand();
const resetPasswordCommand = new ResetPasswordCommand();
const changePasswordCommand = new ChangePasswordCommand();
const updateFcmTokenCommand = new UpdateFcmTokenCommand();
const updateProfileCommand = new UpdateProfileCommand();
const logoutAllCommand = new LogoutAllCommand();
const deleteAccountCommand = new DeleteAccountCommand();
const listSessionsQuery = new ListSessionsQuery();
const revokeSessionCommand = new RevokeSessionCommand();
const listDevicesQuery = new ListDevicesQuery();
const removeDeviceCommand = new RemoveDeviceCommand();
const getProfileQuery = new GetProfileQuery();
const getNotificationPreferencesQuery = new GetNotificationPreferencesQuery();
const updateNotificationPreferencesCommand = new UpdateNotificationPreferencesCommand();
const registerPushTokenCommand = new RegisterPushTokenCommand();
const unregisterPushTokenCommand = new UnregisterPushTokenCommand();

function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key of Object.keys(obj) as Array<keyof T>) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

export const authController = {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const dto = registerSchema.parse(request.body);
    const result = await registerCommand.execute(
      dto,
      request.ip,
      request.headers['user-agent'],
    );
    return reply.status(201).send(successResponse(result, MESSAGES.REGISTER_SUCCESS));
  },

  async login(request: FastifyRequest, reply: FastifyReply) {
    const dto = loginSchema.parse(request.body);
    const result = await loginCommand.execute(
      dto,
      request.ip,
      request.headers['user-agent'],
    );
    return reply.status(200).send(successResponse(result, MESSAGES.LOGIN_SUCCESS));
  },

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = refreshTokenSchema.parse(request.body);
    await logoutCommand.execute(
      refreshToken,
      request.ip,
      request.headers['user-agent'],
    );
    return reply.status(200).send(successResponse({}, MESSAGES.LOGOUT_SUCCESS));
  },

  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = refreshTokenSchema.parse(request.body);
    const result = await refreshTokenCommand.execute(refreshToken);
    return reply.status(200).send(successResponse(result, MESSAGES.TOKEN_REFRESHED));
  },

  async sendOtp(request: FastifyRequest, reply: FastifyReply) {
    const { email, type } = sendOtpSchema.parse(request.body);
    await sendOtpCommand.execute(email, type || 'EMAIL_VERIFICATION');
    return reply.status(200).send(successResponse({}, 'OTP sent successfully.'));
  },

  async resendOtp(request: FastifyRequest, reply: FastifyReply) {
    const { email, type } = sendOtpSchema.parse(request.body);
    await sendOtpCommand.execute(email, type || 'EMAIL_VERIFICATION');
    return reply.status(200).send(successResponse({}, 'OTP resent successfully.'));
  },

  async verifyOtp(request: FastifyRequest, reply: FastifyReply) {
    const { email, code, type } = verifyOtpSchema.parse(request.body);
    const result = await verifyOtpCommand.execute(
      email, code, type || 'EMAIL_VERIFICATION',
      request.ip, request.headers['user-agent'],
    );
    return reply.status(200).send(successResponse(result, 'OTP verified successfully.'));
  },

  async verifyResetOtp(request: FastifyRequest, reply: FastifyReply) {
    const { email, code, type } = verifyResetOtpSchema.parse(request.body);
    const result = await verifyOtpCommand.execute(
      email, code, type || 'PASSWORD_RESET',
      request.ip, request.headers['user-agent'],
    );
    return reply.status(200).send(successResponse(result, 'OTP verified successfully.'));
  },

  async forgotPassword(request: FastifyRequest, reply: FastifyReply) {
    const { email } = forgotPasswordSchema.parse(request.body);
    await forgotPasswordCommand.execute(email);
    return reply.status(200).send(successResponse({}, 'Password reset OTP sent.'));
  },

  async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    const { email, code, password } = resetPasswordSchema.parse(request.body);
    await resetPasswordCommand.execute(
      email, code, password,
      request.ip, request.headers['user-agent'],
    );
    return reply.status(200).send(successResponse({}, 'Password reset successfully.'));
  },

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    const authReq = request as AuthenticatedRequest;
    const result = await getProfileQuery.execute(authReq.userId);
    return reply.status(200).send(successResponse(result, 'Profile fetched successfully.'));
  },

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const authReq = request as AuthenticatedRequest;
    const raw = updateProfileSchema.parse(request.body);
    const dto = compact(raw) as Parameters<typeof updateProfileCommand.execute>[1];
    const result = await updateProfileCommand.execute(
      authReq.userId, dto,
      request.ip, request.headers['user-agent'],
    );
    return reply.status(200).send(successResponse(result, 'Profile updated successfully.'));
  },

  async changePassword(request: FastifyRequest, reply: FastifyReply) {
    const authReq = request as AuthenticatedRequest;
    const { currentPassword, newPassword } = changePasswordSchema.parse(request.body);
    await changePasswordCommand.execute(
      authReq.userId, currentPassword, newPassword,
      request.ip, request.headers['user-agent'],
    );
    return reply.status(200).send(successResponse({}, 'Password changed successfully.'));
  },

  async updateFcmToken(request: FastifyRequest, reply: FastifyReply) {
    const authReq = request as AuthenticatedRequest;
    const raw = updateFcmTokenSchema.parse(request.body);
    const dto = compact(raw) as Parameters<typeof updateFcmTokenCommand.execute>[1];
    const result = await updateFcmTokenCommand.execute(authReq.userId, dto);
    return reply.status(200).send(successResponse(result, 'FCM token updated successfully.'));
  },

  async getDevices(request: FastifyRequest, reply: FastifyReply) {
    const authReq = request as AuthenticatedRequest;
    const result = await listDevicesQuery.execute(authReq.userId);
    return reply.status(200).send(successResponse(result, 'Devices fetched successfully.'));
  },

  async removeDevice(request: FastifyRequest, reply: FastifyReply) {
    const authReq = request as AuthenticatedRequest;
    const { deviceId } = request.params as { deviceId: string };
    const result = await removeDeviceCommand.execute(
      deviceId, authReq.userId,
      request.ip, request.headers['user-agent'],
    );
    return reply.status(200).send(successResponse(result, 'Device removed successfully.'));
  },

  async getSessions(request: FastifyRequest, reply: FastifyReply) {
    const authReq = request as AuthenticatedRequest;
    const result = await listSessionsQuery.execute(authReq.userId, authReq.sessionId);
    return reply.status(200).send(successResponse(result, 'Sessions fetched successfully.'));
  },

  async revokeSession(request: FastifyRequest, reply: FastifyReply) {
    const authReq = request as AuthenticatedRequest;
    const { sessionId } = request.params as { sessionId: string };
    const result = await revokeSessionCommand.execute(
      sessionId, authReq.userId,
      request.ip, request.headers['user-agent'],
      authReq.sessionId,
    );
    return reply.status(200).send(successResponse(result, 'Session revoked successfully.'));
  },

  async logoutAll(request: FastifyRequest, reply: FastifyReply) {
    const authReq = request as AuthenticatedRequest;
    const result = await logoutAllCommand.execute(
      authReq.userId,
      request.ip, request.headers['user-agent'],
    );
    return reply.status(200).send(successResponse(result, 'Logged out of all devices.'));
  },

  async deleteAccount(request: FastifyRequest, reply: FastifyReply) {
    const authReq = request as AuthenticatedRequest;
    const { password } = deleteAccountSchema.parse(request.body);
    const result = await deleteAccountCommand.execute(authReq.userId, password);
    return reply.status(200).send(successResponse(result, 'Account deleted successfully.'));
  },

  async getNotificationPreferences(request: FastifyRequest, reply: FastifyReply) {
    const authReq = request as AuthenticatedRequest;
    const result = await getNotificationPreferencesQuery.execute(authReq.userId);
    return reply.status(200).send(successResponse(result, 'Notification preferences fetched.'));
  },

  async updateNotificationPreferences(request: FastifyRequest, reply: FastifyReply) {
    const authReq = request as AuthenticatedRequest;
    const updates = compact(notificationPreferencesSchema.parse(request.body)) as Record<string, boolean>;
    const result = await updateNotificationPreferencesCommand.execute(authReq.userId, updates);
    return reply.status(200).send(successResponse(result, 'Notification preferences updated.'));
  },

  async registerPushToken(request: FastifyRequest, reply: FastifyReply) {
    const authReq = request as AuthenticatedRequest;
    const dto = compact(registerPushTokenSchema.parse(request.body)) as Parameters<
      typeof registerPushTokenCommand.execute
    >[1];
    const result = await registerPushTokenCommand.execute(authReq.userId, dto);
    return reply.status(200).send(successResponse(result, 'Push token registered.'));
  },

  async unregisterPushToken(request: FastifyRequest, reply: FastifyReply) {
    const authReq = request as AuthenticatedRequest;
    const { expoPushToken } = unregisterPushTokenSchema.parse(request.body);
    const result = await unregisterPushTokenCommand.execute(authReq.userId, expoPushToken);
    return reply.status(200).send(successResponse(result, 'Push token removed.'));
  },
};
