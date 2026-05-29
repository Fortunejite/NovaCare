import { z } from "zod";

export const createPharmacistSchema = z.object({
  email: z.email('Invalid Email format'),
  firstName: z.string().min(3),
  lastName: z.string().min(3),
  gender: z.string().min(3),
  phoneNumber: z.string().min(10),
  address: z.string().min(5),
  qualification: z.string().min(5),
  licenseNumber: z.string().min(5),
})

export type CreatePharmacistDto = z.infer<typeof createPharmacistSchema>;

export const updatePharmacistSchema = z.object({
  email: z.email('Invalid Email format').optional(),
  firstName: z.string().min(3).optional(),
  lastName: z.string().min(3).optional(),
  gender: z.string().min(3).optional(),
  phoneNumber: z.string().min(10).optional(),
  address: z.string().min(5).optional(),
  qualification: z.string().min(5).optional(),
  licenseNumber: z.string().min(5).optional(),
})

export type UpdatePharmacistDto = z.infer<typeof updatePharmacistSchema>;