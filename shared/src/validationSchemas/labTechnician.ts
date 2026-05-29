import { z } from "zod";

export const createLabTechnicianSchema = z.object({
  email: z.email('Invalid Email format'),
  firstName: z.string().min(3),
  lastName: z.string().min(3),
  gender: z.string().min(3),
  phoneNumber: z.string().min(10),
  address: z.string().min(5),
  qualification: z.string().min(5),
})

export type CreateLabTechnicianDto = z.infer<typeof createLabTechnicianSchema>;

export const updateLabTechnicianSchema = z.object({
  email: z.email('Invalid Email format').optional(),
  firstName: z.string().min(3).optional(),
  lastName: z.string().min(3).optional(),
  gender: z.string().min(3).optional(),
  phoneNumber: z.string().min(10).optional(),
  address: z.string().min(5).optional(),
  qualification: z.string().min(5).optional(),
})

export type UpdateLabTechnicianDto = z.infer<typeof updateLabTechnicianSchema>;