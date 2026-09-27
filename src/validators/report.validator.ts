import { z } from 'zod';

export const reportTypeEnum = z.enum(['ON', 'OFF']);
export const deviceTypeEnum = z.enum(['ANDROID', 'IOS', 'WEB']);

export const createReportSchema = z.object({
  neighborhoodId: z
    .number({ message: 'Neighborhood ID is required.' })
    .int('Neighborhood ID must be an integer.')
    .positive('Invalid neighborhood.'),
  reportType: reportTypeEnum,
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
  deviceType: deviceTypeEnum.optional(),
});

export const getReportsQuerySchema = z.object({
  neighborhoodId: z
    .string()
    .optional()
    .transform((v) => (v ? (isNaN(Number(v)) ? undefined : Number(v)) : undefined)),
  userId: z.string().uuid().optional(),
  reportType: reportTypeEnum.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z
    .string()
    .optional()
    .default('1')
    .transform((v) => Math.max(1, Number(v) || 1)),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((v) => Math.min(100, Math.max(1, Number(v) || 20))),
});

export const reportIdSchema = z.object({
  id: z.string({ message: 'Report ID is required.' }).uuid('Invalid report ID.'),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type GetReportsQueryInput = z.infer<typeof getReportsQuerySchema>;

export const neighborhoodQuerySchema = z.object({
  neighborhoodId: z.coerce.number().int().positive().optional(),
});

export const activityQuerySchema = neighborhoodQuerySchema.extend({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const historySummaryQuerySchema = neighborhoodQuerySchema.extend({
  days: z.coerce.number().int().min(1).max(30).default(7),
});
