import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { env } from '../configs/env.config.js';

/** Buckets by target email (falling back to IP) so rotating IPs can't bypass per-account limits. */
function emailKey(prefix: string) {
  return (request: FastifyRequest) => {
    const email = (request.body as { email?: unknown } | undefined)?.email;
    return typeof email === 'string' && email.trim()
      ? `${prefix}:${email.toLowerCase().trim()}`
      : `${prefix}:ip:${request.ip}`;
  };
}

// preHandler hook so the body is parsed before the key is generated.
const loginRateLimit = {
  max: env.rateLimit.authMax,
  timeWindow: env.rateLimit.authWindowMs,
  hook: 'preHandler' as const,
  keyGenerator: emailKey('login'),
};

const otpSendRateLimit = {
  max: env.rateLimit.otpMax,
  timeWindow: env.rateLimit.otpWindowMs,
  hook: 'preHandler' as const,
  keyGenerator: emailKey('otp-send'),
};

const authIpRateLimit = {
  max: env.rateLimit.authMax,
  timeWindow: env.rateLimit.authWindowMs,
};

export const authRoutes: FastifyPluginAsync = async (app) => {
  // --- Public endpoints ---
  app.post('/register', {
    config: { rateLimit: authIpRateLimit },
    schema: {
      description:
        'Register a new user account and email a verification code. Send either fullName or firstName (+ lastName). ' +
        'Location is optional: send the full hierarchy (stateId, lgaId, cityId, townId, neighborhoodId), GPS coordinates ' +
        '(resolved via reverse geocoding), or nothing and set it later with PATCH /auth/profile.',
      tags: ['Auth'],
      summary: 'Register a new user',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          fullName: { type: 'string', description: 'Full name; split into first and last name', example: 'Oluwayemi Oyinlola' },
          firstName: { type: 'string', description: "User's first name (if fullName is not sent)", example: 'Oluwayemi' },
          lastName: { type: 'string', description: "User's last name", example: 'Oyinlola' },
          email: { type: 'string', format: 'email', description: 'Must be unique', example: 'user@example.com' },
          password: { type: 'string', minLength: 8, description: 'Strong password', example: 'StrongPassword@123' },
          confirmPassword: { type: 'string', description: 'Must match password', example: 'StrongPassword@123' },
          countryId: { type: 'integer', description: 'Existing country ID (optional, defaults to Nigeria)', example: 1 },
          stateId: { type: 'integer', description: 'Existing state ID', example: 25 },
          lgaId: { type: 'integer', description: 'Existing LGA ID', example: 210 },
          cityId: { type: 'integer', description: 'Existing city ID', example: 815 },
          townId: { type: 'integer', description: 'Existing town ID', example: 4200 },
          neighborhoodId: { type: 'integer', description: 'Existing neighborhood ID', example: 9012 },
          latitude: { type: 'number', description: 'GPS latitude', example: 6.524379 },
          longitude: { type: 'number', description: 'GPS longitude', example: 3.379206 },
          notificationEnabled: { type: 'boolean', description: 'Push notification preference', default: true },
          deviceName: { type: 'string', description: 'Device model', example: 'iPhone 15 Pro' },
          deviceType: { type: 'string', enum: ['ANDROID', 'IOS', 'WEB'], description: 'Device platform' },
        },
      },
      response: {
        201: {
          description: 'User registered successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User registered successfully.' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
                    firstName: { type: 'string', example: 'Oluwayemi' },
                    lastName: { type: 'string', example: 'Oyinlola' },
                    email: { type: 'string', example: 'user@example.com' },
                    role: { type: 'string', example: 'USER' },
                    emailVerified: { type: 'boolean', example: false },
                  },
                },
                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                verificationEmailSent: {
                  type: 'boolean',
                  description: 'False if the code email failed; offer "resend code".',
                },
              },
            },
          },
        },
      },
    },
  }, authController.register);

  app.post('/login', {
    config: { rateLimit: loginRateLimit },
    schema: {
      description: 'Authenticate a user with email and password.',
      tags: ['Auth'],
      summary: 'Login',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', example: 'StrongPassword@123' },
        },
      },
      response: {
        200: {
          description: 'Login successful',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful.' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                    firstName: { type: 'string', example: 'Oluwayemi' },
                    lastName: { type: 'string', example: 'Oyinlola' },
                    email: { type: 'string', example: 'user@example.com' },
                    role: { type: 'string', example: 'USER' },
                    emailVerified: { type: 'boolean', example: false },
                  },
                },
                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
              },
            },
          },
        },
      },
    },
  }, authController.login);

  app.post('/logout', {
    schema: {
      description: 'Logout a user by revoking the refresh token.',
      tags: ['Auth'],
      summary: 'Logout',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        },
      },
      response: {
        200: {
          description: 'Logout successful',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Logout successful.' },
            data: { type: 'object', example: {} },
          },
        },
      },
    },
  }, authController.logout);

  app.post('/refresh-token', {
    schema: {
      description: 'Refresh access and refresh tokens using a valid refresh token.',
      tags: ['Auth'],
      summary: 'Refresh tokens',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        },
      },
      response: {
        200: {
          description: 'Token refreshed successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Token refreshed successfully.' },
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
              },
            },
          },
        },
      },
    },
  }, authController.refreshToken);

  app.post('/send-otp', {
    config: { rateLimit: otpSendRateLimit },
    schema: {
      description: 'Send a one-time verification code for email verification or password reset.',
      tags: ['Auth'],
      summary: 'Send OTP',
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          type: { type: 'string', enum: ['EMAIL_VERIFICATION', 'PASSWORD_RESET'], example: 'EMAIL_VERIFICATION' },
        },
      },
      response: {
        200: {
          description: 'OTP sent successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'OTP sent successfully.' },
            data: { type: 'object', example: {} },
          },
        },
      },
    },
  }, authController.sendOtp);

  app.post('/resend-otp', {
    config: { rateLimit: otpSendRateLimit },
    schema: {
      description: 'Resend a previously requested OTP code.',
      tags: ['Auth'],
      summary: 'Resend OTP',
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          type: { type: 'string', enum: ['EMAIL_VERIFICATION', 'PASSWORD_RESET'], example: 'EMAIL_VERIFICATION' },
        },
      },
      response: {
        200: {
          description: 'OTP resent successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'OTP resent successfully.' },
            data: { type: 'object', example: {} },
          },
        },
      },
    },
  }, authController.resendOtp);

  app.post('/verify-otp', {
    config: { rateLimit: authIpRateLimit },
    schema: {
      description: 'Verify a one-time code for email verification.',
      tags: ['Auth'],
      summary: 'Verify OTP',
      body: {
        type: 'object',
        required: ['email', 'code'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          code: { type: 'string', example: '123456' },
          type: { type: 'string', enum: ['EMAIL_VERIFICATION', 'PASSWORD_RESET'], example: 'EMAIL_VERIFICATION' },
        },
      },
      response: {
        200: {
          description: 'OTP verified successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'OTP verified successfully.' },
            data: {
              type: 'object',
              properties: {
                verified: { type: 'boolean', example: true },
                type: { type: 'string', example: 'EMAIL_VERIFICATION' },
              },
            },
          },
        },
      },
    },
  }, authController.verifyOtp);

  app.post('/verify-reset-otp', {
    config: { rateLimit: authIpRateLimit },
    schema: {
      description: 'Verify a reset OTP before allowing password change.',
      tags: ['Auth'],
      summary: 'Verify reset OTP',
      body: {
        type: 'object',
        required: ['email', 'code'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          code: { type: 'string', example: '123456' },
          type: { type: 'string', enum: ['EMAIL_VERIFICATION', 'PASSWORD_RESET'], example: 'PASSWORD_RESET' },
        },
      },
      response: {
        200: {
          description: 'OTP verified successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'OTP verified successfully.' },
            data: {
              type: 'object',
              properties: {
                verified: { type: 'boolean', example: true },
                type: { type: 'string', example: 'PASSWORD_RESET' },
              },
            },
          },
        },
      },
    },
  }, authController.verifyResetOtp);

  app.post('/forgot-password', {
    config: { rateLimit: otpSendRateLimit },
    schema: {
      description: 'Request a password reset OTP for an existing account.',
      tags: ['Auth'],
      summary: 'Forgot password',
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
        },
      },
      response: {
        200: {
          description: 'Password reset OTP sent',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Password reset OTP sent.' },
            data: { type: 'object', example: {} },
          },
        },
      },
    },
  }, authController.forgotPassword);

  app.post('/reset-password', {
    config: { rateLimit: authIpRateLimit },
    schema: {
      description: 'Reset a password using an OTP code.',
      tags: ['Auth'],
      summary: 'Reset password',
      body: {
        type: 'object',
        required: ['email', 'code', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          code: { type: 'string', example: '123456' },
          password: { type: 'string', minLength: 8, example: 'NewStrongPassword@123' },
          confirmPassword: { type: 'string', example: 'NewStrongPassword@123' },
        },
      },
      response: {
        200: {
          description: 'Password reset successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Password reset successfully.' },
            data: { type: 'object', example: {} },
          },
        },
      },
    },
  }, authController.resetPassword);

  // --- Authenticated endpoints ---
  app.get('/me', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Get the currently authenticated user profile.',
      tags: ['Auth'],
      summary: 'Get my profile',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Profile fetched successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, authController.getMe);

  app.patch('/profile', {
    preHandler: [authMiddleware],
    schema: {
      description:
        'Update the authenticated user profile. Setting neighborhoodId sets the primary location ' +
        '(state, LGA, city and town are filled in automatically); null clears it.',
      tags: ['Auth'],
      summary: 'Update profile',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          fullName: { type: 'string', example: 'Oluwayemi Oyinlola' },
          firstName: { type: 'string', example: 'Oluwayemi' },
          lastName: { type: 'string', example: 'Oyinlola' },
          notificationEnabled: { type: 'boolean' },
          latitude: { type: 'number', nullable: true },
          longitude: { type: 'number', nullable: true },
          neighborhoodId: { type: 'integer', nullable: true },
        },
      },
      response: {
        200: {
          description: 'Profile updated successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, authController.updateProfile);

  app.get('/notification-preferences', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Get the notification preferences of the authenticated user.',
      tags: ['Auth'],
      summary: 'Get notification preferences',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', properties: {
          notificationEnabled: { type: 'boolean', description: 'Master switch for all push notifications' },
          outageAlerts: { type: 'boolean', description: 'Power went out in my area' },
          restorationAlerts: { type: 'boolean', description: 'Power is back in my area' },
          communityUpdates: { type: 'boolean', description: 'Community reports and neighborhood news' },
        } },
          },
        },
      },
    },
  }, authController.getNotificationPreferences);

  app.patch('/notification-preferences', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Update any of the notification preferences. Send only the ones that change.',
      tags: ['Auth'],
      summary: 'Update notification preferences',
      security: [{ bearerAuth: [] }],
      body: { type: 'object', properties: {
          notificationEnabled: { type: 'boolean', description: 'Master switch for all push notifications' },
          outageAlerts: { type: 'boolean', description: 'Power went out in my area' },
          restorationAlerts: { type: 'boolean', description: 'Power is back in my area' },
          communityUpdates: { type: 'boolean', description: 'Community reports and neighborhood news' },
        } },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', properties: {
          notificationEnabled: { type: 'boolean', description: 'Master switch for all push notifications' },
          outageAlerts: { type: 'boolean', description: 'Power went out in my area' },
          restorationAlerts: { type: 'boolean', description: 'Power is back in my area' },
          communityUpdates: { type: 'boolean', description: 'Community reports and neighborhood news' },
        } },
          },
        },
      },
    },
  }, authController.updateNotificationPreferences);

  app.put('/push-token', {
    preHandler: [authMiddleware],
    schema: {
      description:
        'Register this device\'s Expo push token (from expo-notifications getExpoPushTokenAsync). ' +
        'Call after sign-in and whenever the token changes.',
      tags: ['Auth'],
      summary: 'Register push token',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['expoPushToken'],
        properties: {
          expoPushToken: { type: 'string', example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' },
          deviceName: { type: 'string', example: 'Pixel 8' },
          deviceType: { type: 'string', enum: ['ANDROID', 'IOS', 'WEB'] },
          platform: { type: 'string', example: 'android 15' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', properties: { deviceId: { type: 'string' }, registered: { type: 'boolean' } } },
          },
        },
      },
    },
  }, authController.registerPushToken);

  app.delete('/push-token', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Stop push notifications to this device (call before signing out).',
      tags: ['Auth'],
      summary: 'Remove push token',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['expoPushToken'],
        properties: { expoPushToken: { type: 'string' } },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', properties: { removed: { type: 'boolean' } } },
          },
        },
      },
    },
  }, authController.unregisterPushToken);

  app.patch('/change-password', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Change the authenticated user password.',
      tags: ['Auth'],
      summary: 'Change password',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', example: 'OldPassword@123' },
          newPassword: { type: 'string', minLength: 8, example: 'NewPassword@456' },
          confirmNewPassword: { type: 'string', example: 'NewPassword@456' },
        },
      },
      response: {
        200: {
          description: 'Password changed successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, authController.changePassword);

  app.patch('/update-fcm-token', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Update or register a Firebase Cloud Messaging token for push notifications.',
      tags: ['Auth'],
      summary: 'Update FCM token',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          fcmToken: { type: 'string', example: 'fCMToken123...' },
          deviceName: { type: 'string', example: 'iPhone 15 Pro' },
          deviceType: { type: 'string', enum: ['ANDROID', 'IOS', 'WEB'] },
          browser: { type: 'string', example: 'Chrome 120' },
          platform: { type: 'string', example: 'iOS 17.2' },
        },
      },
      response: {
        200: {
          description: 'FCM token updated',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, authController.updateFcmToken);

  app.get('/devices', {
    preHandler: [authMiddleware],
    schema: {
      description: 'List all registered devices for the authenticated user.',
      tags: ['Auth'],
      summary: 'List devices',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Devices fetched successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'array', items: { type: 'object', additionalProperties: true } },
          },
        },
      },
    },
  }, authController.getDevices);

  app.delete('/devices/:deviceId', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Remove a registered device.',
      tags: ['Auth'],
      summary: 'Remove device',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['deviceId'],
        properties: {
          deviceId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
        },
      },
      response: {
        200: {
          description: 'Device removed successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, authController.removeDevice);

  app.get('/sessions', {
    preHandler: [authMiddleware],
    schema: {
      description: 'List all active sessions for the authenticated user.',
      tags: ['Auth'],
      summary: 'List sessions',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Sessions fetched successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'array', items: { type: 'object', additionalProperties: true } },
          },
        },
      },
    },
  }, authController.getSessions);

  app.delete('/sessions/:sessionId', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Revoke an active session.',
      tags: ['Auth'],
      summary: 'Revoke session',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['sessionId'],
        properties: {
          sessionId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
        },
      },
      response: {
        200: {
          description: 'Session revoked successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, authController.revokeSession);

  app.post('/logout-all', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Logout from all devices by revoking all refresh tokens and sessions.',
      tags: ['Auth'],
      summary: 'Logout all devices',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Logged out of all devices',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, authController.logoutAll);

  app.delete('/delete-account', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Permanently delete the authenticated user account. Requires password confirmation.',
      tags: ['Auth'],
      summary: 'Delete account',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['password'],
        properties: {
          password: { type: 'string', example: 'StrongPassword@123' },
        },
      },
      response: {
        200: {
          description: 'Account deleted successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, authController.deleteAccount);
};
