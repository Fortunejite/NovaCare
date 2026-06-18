import { z } from "zod";

export const createPrescriptionSchema = z.object({
  medicationId: z.string().min(1, "Medicine ID is required"),
  dosage: z.string("Dosage is reqired"),
  frequency: z.string("Frequency is reqired"),
  duration: z.string("Duration is reqired"),
})

export type CreatePrescriptionSchemaDto = z.infer<typeof createPrescriptionSchema>;

export const updatePrescriptionSchema = z.object({
  medicationId: z.string().min(1, "Medicine ID is required").optional(),
  dosage: z.string("Dosage is reqired").optional(),
  frequency: z.string("Frequency is reqired").optional(),
  duration: z.string("Duration is reqired").optional(),
})

export type UpdatePrescriptionSchemaDto = z.infer<typeof updatePrescriptionSchema>;