/**
 * Profile Validation Schemas
 * Using Zod for runtime type validation
 */

import { z } from 'zod';

// Phone number validation (international format)
const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
  .optional()
  .or(z.literal(''));

// URL validation for avatar
const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''));

// Profile Update Schema
export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes')
    .optional(),
  phoneNumber: phoneSchema,
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  avatarUrl: urlSchema,
  preferredStudyTime: z
    .enum(['morning', 'afternoon', 'evening', 'night', 'flexible'])
    .optional(),
  nclexType: z.enum(['RN', 'PN']).optional(),
  examDate: z
    .string()
    .optional()
    .refine(val => {
      if (!val) return true;
      const date = new Date(val);
      return date > new Date();
    }, 'Exam date must be in the future'),
  targetScore: z
    .number()
    .min(0, 'Target score must be at least 0')
    .max(100, 'Target score must be at most 100')
    .optional(),
  goals: z
    .array(z.string().max(200, 'Each goal must be less than 200 characters'))
    .max(10, 'You can have at most 10 goals')
    .optional(),
  weakAreas: z
    .array(z.number().int().min(0).max(7))
    .max(8, 'Invalid weak areas selection')
    .optional()
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// Onboarding Schema
export const onboardingSchema = z.object({
  nclexType: z.enum(['RN', 'PN']).describe('Please select your NCLEX type'),
  examDate: z
    .string()
    .min(1, 'Please select your exam date')
    .refine(val => {
      const date = new Date(val);
      return date > new Date();
    }, 'Exam date must be in the future'),
  preferredStudyTime: z.enum(['morning', 'afternoon', 'evening', 'night', 'flexible']).describe('Please select your preferred study time'),
  studyHoursPerDay: z
    .number()
    .min(1, 'Study at least 1 hour per day')
    .max(12, 'Maximum 12 hours per day'),
  goals: z
    .array(z.string())
    .min(1, 'Please select at least one goal')
    .max(5, 'Select at most 5 goals'),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'retaker']).describe('Please select your experience level')
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

// Contact Form Schema
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(2000, 'Message must be less than 2000 characters')
});

export type ContactFormData = z.infer<typeof contactSchema>;
