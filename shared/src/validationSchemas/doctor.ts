import { z } from "zod";

export const createDoctorSchema = z.object({
  email: z.email('Invalid Email format'),
  firstName: z.string().min(3),
  lastName: z.string().min(3),
  departmentId: z.uuid(),
  phoneNumber: z.string().min(10),
  address: z.string().min(5),
  consultationFee: z.number().positive(),
  yearsOfExperience: z.number().positive(),
  licenseNumber: z.string().min(5),
})

export type CreateDoctorDto = z.infer<typeof createDoctorSchema>;

export const updateDoctorSchema = z.object({
  email: z.email('Invalid Email format').optional(),
  firstName: z.string().min(3).optional(),
  lastName: z.string().min(3).optional(),
  departmentId: z.uuid().optional(),
  phoneNumber: z.string().min(10).optional(),
  address: z.string().min(5).optional(),
  consultationFee: z.number().positive().optional(),
  yearsOfExperience: z.number().positive().optional(),
  licenseNumber: z.string().min(5).optional(),
})

export type UpdateDoctorDto = z.infer<typeof updateDoctorSchema>;