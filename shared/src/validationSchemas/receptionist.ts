import { z } from "zod";

export const createReceptionistSchema = z.object({
  email: z.email('Invalid Email format'),
  firstName: z.string().min(3),
  lastName: z.string().min(3),
  gender: z.string().min(3),
  phoneNumber: z.string().min(10),
  address: z.string().min(5),
  dateOfBirth: z.iso.datetime().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
})

export type CreateReceptionistDto = z.infer<typeof createReceptionistSchema>;

export const updateReceptionistSchema = z.object({
  email: z.email('Invalid Email format').optional(),
  firstName: z.string().min(3).optional(),
  lastName: z.string().min(3).optional(),
  gender: z.string().min(3).optional(),
  phoneNumber: z.string().min(10).optional(),
  address: z.string().min(5).optional(),
  dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }).optional(),
})

export type UpdateReceptionistDto = z.infer<typeof updateReceptionistSchema>;