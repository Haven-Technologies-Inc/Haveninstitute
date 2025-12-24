/**
 * Validation Schemas Export
 * Centralized exports for all Zod validation schemas
 */

// Auth validations
export {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  type LoginFormData,
  type RegisterFormData,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
  type ChangePasswordFormData
} from './auth';

// Profile validations
export {
  profileUpdateSchema,
  onboardingSchema,
  contactSchema,
  type ProfileUpdateFormData,
  type OnboardingFormData,
  type ContactFormData
} from './profile';

// Common validation utilities
import { z } from 'zod';

/**
 * Safe parse with error formatting
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.issues.forEach((err: z.ZodIssue) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });
  
  return { success: false, errors };
}

/**
 * Get first error message from Zod error
 */
export function getFirstError(error: z.ZodError): string {
  return error.issues[0]?.message || 'Validation failed';
}

/**
 * Format Zod errors for display
 */
export function formatZodErrors(error: z.ZodError): string[] {
  return error.issues.map((err: z.ZodIssue) => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  });
}
