import { z } from "zod";
import { createPrescriptionSchema } from "../prescriptions";

export const createConsultationSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  prescriptions: z.array(createPrescriptionSchema).optional(),
})

export type CreateConsultationSchemaDto = z.infer<typeof createConsultationSchema>;

export const updateConsultationSchema = z.object({
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
})

export type UpdateConsultationSchemaDto = z.infer<typeof updateConsultationSchema>;
