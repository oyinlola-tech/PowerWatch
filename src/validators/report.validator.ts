import { z } from 'zod';

export const reportTypeEnum = z.enum(['ON', 'OFF']);
export const deviceTypeEnum = z.enum(['ANDROID', 'IOS', 'WEB']);

// A report always counts for the place the reporter's GPS puts them in, so a fresh
// location is required. Older clients also send neighborhoodId; it is ignored.
export const createReportSchema = z.object({
  neighborhoodId: z.number().int().positive().optional(),
  reportType: reportTypeEnum,
  latitude: z
    .number({ message: 'Your location is required to report.' })
    .min(-90, 'Latitude must be between -90 and 90.')
    .max(90, 'Latitude must be between -90 and 90.'),
  longitude: z
    .number({ message: 'Your location is required to report.' })
    .min(-180, 'Longitude must be between -180 and 180.')
    .max(180, 'Longitude must be between -180 and 180.'),
  /** GPS accuracy radius in metres */
  accuracy: z.number({ message: 'Location accuracy is required to report.' }).min(0).max(100_000),
  /** Set by Android when the position comes from a mock-location app */
  mocked: z.boolean().optional(),
  deviceType: deviceTypeEnum.optional(),
});

// Fastify has already coerced query params declared as integers, so accept numbers or strings.
export const getReportsQuerySchema = z.object({
  neighborhoodId: z.coerce.number().int().positive().optional(),
  userId: z.string().uuid().optional(),
  reportType: reportTypeEnum.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).catch(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).catch(20).default(20),
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
