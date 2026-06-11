import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  description: z.string().optional(),
});

export type CreateDepartmentDto = z.infer<typeof createDepartmentSchema>;

export const updateDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').optional(),
  description: z.string().optional(),
});

export type UpdateDepartmentDto = z.infer<typeof updateDepartmentSchema>;
