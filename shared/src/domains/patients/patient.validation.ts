import { z } from "zod";

export const createPatientSchema = z.object({
  email: z.email('Invalid Email format'),
  firstName: z.string().min(3),
  lastName: z.string().min(3),
  gender: z.string().min(3),
  dateOfBirth: z.coerce.date({ message: 'Invalid date format' }),
  bloodGroup: z.string().min(2),
  genotype: z.string().min(2),

  phoneNumber: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),

  weight: z.number().positive(),
  height: z.number().positive(),

  emergencyContactName: z.string().min(3),
  emergencyContactPhone: z.string().min(10),
  emergencyContactRelationship: z.string().min(3),

  allergies: z.string().min(3).optional(),
  medicalHistory: z.string().min(5).optional(),

  status: z.enum(['active', 'discharged', 'deceased', 'admitted']).default('active')
})

export type CreatePatientDto = z.infer<typeof createPatientSchema>;

export const updatePatientSchema = z.object({
  email: z.email('Invalid Email format').optional(),
  firstName: z.string().min(3).optional(),
  lastName: z.string().min(3).optional(),
  gender: z.string().min(3).optional(),
  dateOfBirth: z.coerce.date({ message: 'Invalid date format' }).optional(),
  bloodGroup: z.string().min(2).optional(),
  genotype: z.string().min(2).optional(),

  phoneNumber: z.string().min(10).optional(),
  address: z.string().min(5).optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),

  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),

  emergencyContactName: z.string().min(3).optional(),
  emergencyContactPhone: z.string().min(10).optional(),
  emergencyContactRelationship: z.string().min(3).optional(),

  allergies: z.string().min(3).optional(),
  medicalHistory: z.string().min(5).optional(),

  status: z.enum(['active', 'discharged', 'deceased', 'admitted']).optional()
})

export type UpdatePatientDto = z.infer<typeof updatePatientSchema>;