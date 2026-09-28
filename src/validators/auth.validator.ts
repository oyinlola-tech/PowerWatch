import { z } from 'zod';

const deviceTypeEnum = z.enum(['ANDROID', 'IOS', 'WEB']);
const otpTypeEnum = z.enum(['EMAIL_VERIFICATION', 'PASSWORD_RESET']);

const fullNameSchema = z
  .string({ message: 'Full name must be text.' })
  .trim()
  .min(1, 'Full name is required.')
  .max(101, 'Full name must not exceed 101 characters.');

/** "Ada Lovelace Byron" -> first "Ada", last "Lovelace Byron". A single word leaves last name empty. */
export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const [first = '', ...rest] = fullName.trim().split(/\s+/);
  return { firstName: first.slice(0, 50), lastName: rest.join(' ').slice(0, 50) };
}

const emailSchema = z
  .string({ message: 'Email is required.' })
  .trim()
  .toLowerCase()
  .email('Invalid email address.')
  .max(255, 'Email must not exceed 255 characters.');

export const passwordSchema = z
  .string({ message: 'Password is required.' })
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password must not exceed 128 characters.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.');

export const registerSchema = z
  .object({
    // Either fullName (as the app's single "Full Name" field sends) or firstName (+ lastName).
    fullName: fullNameSchema.optional(),

    firstName: z
      .string({ message: 'First name is required.' })
      .trim()
      .min(1, 'First name is required.')
      .max(50, 'First name must not exceed 50 characters.')
      .optional(),

    lastName: z
      .string({ message: 'Last name must be text.' })
      .trim()
      .max(50, 'Last name must not exceed 50 characters.')
      .optional(),

    email: emailSchema,

    password: passwordSchema,

    confirmPassword: z
      .string({ message: 'Confirm password is required.' })
      .min(1, 'Confirm password is required.')
      .optional(),

    countryId: z
      .number({ message: 'Country must be a number.' })
      .int('Country must be an integer.')
      .positive('Invalid country.')
      .optional(),

    stateId: z
      .number({ message: 'State must be a number.' })
      .int('State must be an integer.')
      .positive('Invalid state.')
      .optional(),

    lgaId: z
      .number({ message: 'LGA must be a number.' })
      .int('LGA must be an integer.')
      .positive('Invalid LGA.')
      .optional(),

    cityId: z
      .number({ message: 'City must be a number.' })
      .int('City must be an integer.')
      .positive('Invalid city.')
      .optional(),

    townId: z
      .number({ message: 'Town must be a number.' })
      .int('Town must be an integer.')
      .positive('Invalid town.')
      .optional(),

    neighborhoodId: z
      .number({ message: 'Neighborhood must be a number.' })
      .int('Neighborhood must be an integer.')
      .positive('Invalid neighborhood.')
      .optional(),

    latitude: z
      .number()
      .min(-90, 'Latitude must be between -90 and 90.')
      .max(90, 'Latitude must be between -90 and 90.')
      .optional(),

    longitude: z
      .number()
      .min(-180, 'Longitude must be between -180 and 180.')
      .max(180, 'Longitude must be between -180 and 180.')
      .optional(),

    /** GPS accuracy radius in metres */
    accuracy: z.number().min(0).max(100_000).optional(),

    /** Set by Android when the position comes from a mock-location app */
    mocked: z.boolean().optional(),

    notificationEnabled: z.boolean().optional(),

    deviceName: z
      .string()
      .max(100, 'Device name must not exceed 100 characters.')
      .optional(),

    deviceType: deviceTypeEnum.optional(),

    // Accounts are only created with recorded agreement to the Terms and Privacy Policy
    acceptedTerms: z.literal(true, {
      message: 'You must agree to the Terms & Conditions and Privacy Policy.',
    }),

    // Version (date) of the documents the person was shown
    termsVersion: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Terms version must be a date (YYYY-MM-DD).')
      .optional(),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
  .superRefine((data, ctx) => {
    if (!data.fullName && !data.firstName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Full name is required.',
        path: ['fullName'],
      });
    }

    const hasFullHierarchy =
      data.stateId !== undefined &&
      data.lgaId !== undefined &&
      data.cityId !== undefined &&
      data.townId !== undefined &&
      data.neighborhoodId !== undefined;

    const hasPartialHierarchy =
      data.stateId !== undefined ||
      data.lgaId !== undefined ||
      data.cityId !== undefined ||
      data.townId !== undefined ||
      data.neighborhoodId !== undefined;

    const hasCoordinates =
      data.latitude !== undefined && data.longitude !== undefined;

    // Location is optional here: the app sets it after sign-up via PATCH /auth/profile.
    if ((data.latitude === undefined) !== (data.longitude === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide both latitude and longitude.',
        path: ['latitude'],
      });
    }

    if (hasPartialHierarchy && !hasFullHierarchy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'When providing location IDs, all of stateId, lgaId, cityId, townId, and neighborhoodId are required.',
        path: ['stateId'],
      });
    }

    if (hasFullHierarchy && hasCoordinates) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide either location IDs or GPS coordinates, not both.',
        path: ['latitude'],
      });
    }
  })
  .transform(({ fullName, firstName, lastName, ...rest }) => ({
    ...rest,
    ...(fullName ? splitFullName(fullName) : { firstName: firstName ?? '', lastName: lastName ?? '' }),
  }));

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ message: 'Password is required.' }).min(1, 'Password is required.'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string({ message: 'Refresh token is required.' }).min(1, 'Refresh token is required.'),
});

export const sendOtpSchema = z.object({
  email: emailSchema,
  type: otpTypeEnum.optional(),
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  code: z.string({ message: 'OTP code is required.' }).trim().length(6, 'OTP code must be 6 digits.'),
  type: otpTypeEnum.optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    code: z.string({ message: 'OTP code is required.' }).trim().length(6, 'OTP code must be 6 digits.'),
    password: passwordSchema,
    confirmPassword: z
      .string({ message: 'Confirm password is required.' })
      .min(1, 'Confirm password is required.')
      .optional(),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string({ message: 'Current password is required.' }).min(1, 'Current password is required.'),
    newPassword: passwordSchema,
    confirmNewPassword: z
      .string({ message: 'Confirm new password is required.' })
      .min(1, 'Confirm new password is required.')
      .optional(),
  })
  .refine((data) => !data.confirmNewPassword || data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match.',
    path: ['confirmNewPassword'],
  });

export const updateProfileSchema = z.object({
  fullName: fullNameSchema.optional(),
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required.')
    .max(50, 'First name must not exceed 50 characters.')
    .optional(),
  lastName: z
    .string()
    .trim()
    .max(50, 'Last name must not exceed 50 characters.')
    .optional(),
  notificationEnabled: z.boolean().optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  /** Sets the primary location; the state/LGA/city/town are filled in from the neighborhood. */
  neighborhoodId: z.number().int().positive().optional().nullable(),
}).transform(({ fullName, ...rest }) => (fullName ? { ...rest, ...splitFullName(fullName) } : rest));

export const updateFcmTokenSchema = z.object({
  fcmToken: z.string().min(1, 'FCM token is required.').optional(),
  deviceName: z.string().max(100).optional().nullable(),
  deviceType: deviceTypeEnum.optional().nullable(),
  browser: z.string().max(100).optional().nullable(),
  platform: z.string().max(50).optional().nullable(),
});

export const notificationPreferencesSchema = z
  .object({
    notificationEnabled: z.boolean().optional(),
    outageAlerts: z.boolean().optional(),
    restorationAlerts: z.boolean().optional(),
    communityUpdates: z.boolean().optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), {
    message: 'Provide at least one preference to update.',
  });

const expoPushTokenSchema = z
  .string({ message: 'expoPushToken is required.' })
  .trim()
  .regex(/^Expo(nent)?PushToken\[[^\]]+\]$/, 'Must be an Expo push token, e.g. ExponentPushToken[xxxx].')
  .max(255);

export const registerPushTokenSchema = z.object({
  expoPushToken: expoPushTokenSchema,
  deviceName: z.string().trim().max(100).optional(),
  deviceType: deviceTypeEnum.optional(),
  platform: z.string().trim().max(50).optional(),
});

export const unregisterPushTokenSchema = z.object({
  expoPushToken: expoPushTokenSchema,
});

export const deleteAccountSchema = z.object({
  password: z.string({ message: 'Password is required.' }).min(1, 'Password is required.'),
});

export const verifyResetOtpSchema = z.object({
  email: emailSchema,
  code: z.string({ message: 'OTP code is required.' }).trim().length(6, 'OTP code must be 6 digits.'),
  type: otpTypeEnum.optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateFcmTokenInput = z.infer<typeof updateFcmTokenSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type VerifyResetOtpInput = z.infer<typeof verifyResetOtpSchema>;
export type OtpType = z.infer<typeof otpTypeEnum>;
