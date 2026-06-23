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

export const dispensePrescriptionSchema = z.object({
  dispensedItems: z.array(
    z.object({
      itemId: z.string().min(1, "Prescribed Item ID is required"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
    })
  ).min(1, "At least one dispensed item is required"),
})

export type DispensePrescriptionSchemaDto = z.infer<typeof dispensePrescriptionSchema>;