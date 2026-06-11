import { z } from 'zod';

export const loginUserSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  rememberMe: z.boolean().optional(),
});

export type LoginUserDto = z.infer<typeof loginUserSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email('Invalid email format'),
});

export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
