/**
 * Security Validation Schemas
 * 
 * Input validation for MFA, OAuth, and security endpoints
 */

import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// MFA TOTP code validation (6 digits)
export const totpCodeSchema = Joi.object({
  totpCode: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length': 'TOTP code must be exactly 6 digits',
      'string.pattern.base': 'TOTP code must contain only numbers',
      'any.required': 'TOTP code is required',
    }),
});

// MFA backup code validation (format: XXXX-XXXX)
export const backupCodeSchema = Joi.object({
  backupCode: Joi.string()
    .length(9)
    .pattern(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/)
    .required()
    .messages({
      'string.length': 'Backup code must be in format XXXX-XXXX',
      'string.pattern.base': 'Invalid backup code format',
      'any.required': 'Backup code is required',
    }),
});

// Password validation for MFA disable/regenerate
export const passwordSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password must not exceed 128 characters',
      'any.required': 'Password is required',
    }),
});

// Google OAuth token validation
export const googleTokenSchema = Joi.object({
  idToken: Joi.string()
    .min(100)
    .required()
    .messages({
      'string.min': 'Invalid Google ID token',
      'any.required': 'Google ID token is required',
    }),
});

// Book creation validation
export const createBookSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.min': 'Title is required',
      'string.max': 'Title must not exceed 500 characters',
      'any.required': 'Title is required',
    }),
  author: Joi.string()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.min': 'Author is required',
      'string.max': 'Author must not exceed 255 characters',
      'any.required': 'Author is required',
    }),
  description: Joi.string().max(5000).allow('', null),
  category: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'any.required': 'Category is required',
    }),
  format: Joi.string().valid('epub', 'pdf').default('epub'),
  coverUrl: Joi.string().uri().allow('', null),
  fileUrl: Joi.string().uri().allow('', null),
  pageCount: Joi.number().integer().min(1).allow(null),
  price: Joi.number().min(0).default(0),
  isFree: Joi.boolean().default(true),
  isPublished: Joi.boolean().default(false),
  tags: Joi.array().items(Joi.string().max(50)).max(20),
  isbn: Joi.string().max(20).allow('', null),
  publisher: Joi.string().max(255).allow('', null),
  publishedAt: Joi.date().allow(null),
  language: Joi.string().length(2).default('en'),
});

// Book update validation (all fields optional)
export const updateBookSchema = Joi.object({
  title: Joi.string().min(1).max(500),
  author: Joi.string().min(1).max(255),
  description: Joi.string().max(5000).allow('', null),
  category: Joi.string().min(1).max(100),
  format: Joi.string().valid('epub', 'pdf'),
  coverUrl: Joi.string().uri().allow('', null),
  fileUrl: Joi.string().uri().allow('', null),
  pageCount: Joi.number().integer().min(1).allow(null),
  price: Joi.number().min(0),
  isFree: Joi.boolean(),
  isPublished: Joi.boolean(),
  tags: Joi.array().items(Joi.string().max(50)).max(20),
  isbn: Joi.string().max(20).allow('', null),
  publisher: Joi.string().max(255).allow('', null),
  publishedAt: Joi.date().allow(null),
  language: Joi.string().length(2),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

// Reading progress update validation
export const progressUpdateSchema = Joi.object({
  currentPage: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.min': 'Current page cannot be negative',
      'any.required': 'Current page is required',
    }),
  totalPages: Joi.number()
    .integer()
    .min(1)
    .messages({
      'number.min': 'Total pages must be at least 1',
    }),
});

// Highlight validation
export const highlightSchema = Joi.object({
  page: Joi.number().integer().min(1).required(),
  text: Joi.string().min(1).max(5000).required(),
  color: Joi.string().valid('yellow', 'green', 'blue', 'pink', 'orange').default('yellow'),
});

// Bookmark validation
export const bookmarkSchema = Joi.object({
  page: Joi.number().integer().min(1).required(),
  title: Joi.string().max(200).allow('', null),
});

// Note validation
export const noteSchema = Joi.object({
  page: Joi.number().integer().min(1).required(),
  content: Joi.string().min(1).max(10000).required(),
});

// Rating validation
export const ratingSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.min': 'Rating must be between 1 and 5',
      'number.max': 'Rating must be between 1 and 5',
      'any.required': 'Rating is required',
    }),
  review: Joi.string().max(5000).allow('', null),
});

// Account deletion confirmation
export const deleteAccountSchema = Joi.object({
  confirmDelete: Joi.string()
    .valid('DELETE_MY_ACCOUNT')
    .required()
    .messages({
      'any.only': 'Please confirm by typing "DELETE_MY_ACCOUNT"',
      'any.required': 'Confirmation is required',
    }),
});

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors,
        },
      });
    }

    req.body = value;
    next();
  };
};

export default {
  totpCodeSchema,
  backupCodeSchema,
  passwordSchema,
  googleTokenSchema,
  createBookSchema,
  updateBookSchema,
  progressUpdateSchema,
  highlightSchema,
  bookmarkSchema,
  noteSchema,
  ratingSchema,
  deleteAccountSchema,
  validate,
};
