import { z } from 'zod';

export const reverseGeocodeSchema = z.object({
  latitude: z
    .number({ message: 'Latitude must be a number.' })
    .min(-90, 'Latitude must be between -90 and 90.')
    .max(90, 'Latitude must be between -90 and 90.'),
  longitude: z
    .number({ message: 'Longitude must be a number.' })
    .min(-180, 'Longitude must be between -180 and 180.')
    .max(180, 'Longitude must be between -180 and 180.'),
});

export type ReverseGeocodeInput = z.infer<typeof reverseGeocodeSchema>;

export const statusMapQuerySchema = z.object({
  lgaId: z.coerce.number().int().positive().optional(),
  stateId: z.coerce.number().int().positive().optional(),
});

export const saveNeighborhoodSchema = z.object({
  neighborhoodId: z.number({ message: 'neighborhoodId is required.' }).int().positive(),
  label: z.string().trim().min(1).max(50).optional(),
});

export const savedNeighborhoodParamsSchema = z.object({
  neighborhoodId: z.coerce.number().int().positive(),
});
