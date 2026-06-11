import z from "zod";

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  datetime: z.iso.datetime().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  reason: z.string().min(5, 'Reason must be at least 5 characters long'),
});

export type CreateAppointmentDto = z.infer<typeof createAppointmentSchema>;

export const updateAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required').optional(),
  doctorId: z.string().min(1, 'Doctor ID is required').optional(),
  date: z.iso.datetime().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }).optional(),
  reason: z.string().min(5, 'Reason must be at least 5 characters long').optional(),
});

export type UpdateAppointmentDto = z.infer<typeof updateAppointmentSchema>;