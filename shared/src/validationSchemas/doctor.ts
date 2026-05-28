import { z } from "zod";

export const createDoctorSchema = z.object({
  email: z.email('Invalid Email format'),
  firstName: z.string().min(3),
  lastName: z.string().min(3),
  departmentId: z.uuid(),
})

export type CreateDoctorDto = z.infer<typeof createDoctorSchema>;

export const updateDoctorSchema = z.object({
  email: z.email('Invalid Email format').optional(),
  firstName: z.string().min(3).optional(),
  lastName: z.string().min(3).optional(),
  departmentId: z.uuid().optional(),
})

export type UpdateDoctorDto = z.infer<typeof updateDoctorSchema>;