import { z } from 'zod';

export const createMedicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be a positive number'),
  stockQuantity: z
    .number()
    .nonnegative('Quantity must be a non-negative integer'),
  weight: z.number().positive('Weight must be a positive number').optional(), // in grams
});

export type CreateMedicineSchemaDto = z.infer<typeof createMedicineSchema>;

export const updateMedicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required').optional(),
  description: z.string().optional(),
  price: z.number().positive('Price must be a positive number').optional(),
  stockQuantity: z
    .number()
    .nonnegative('Quantity must be a non-negative integer')
    .optional(),
  weight: z.number().positive('Weight must be a positive number').optional(), // in grams
});

export type UpdateMedicineSchemaDto = z.infer<typeof updateMedicineSchema>;