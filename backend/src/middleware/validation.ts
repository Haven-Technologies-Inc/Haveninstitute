import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ResponseHandler, errorCodes } from '../utils/response';

// Validation schemas
export const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password must not exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
      }),
    fullName: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name must not exceed 100 characters',
      'any.required': 'Full name is required'
    }),
    nclexType: Joi.string().valid('RN', 'PN').optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    }),
    rememberMe: Joi.boolean().optional()
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required().messages({
      'any.required': 'Refresh token is required'
    })
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
  }),

  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Reset token is required'
    }),
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password must not exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
      }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required'
    }),
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password must not exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'New password is required'
      }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    })
  }),

  verifyEmail: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Verification token is required'
    })
  }),

  updateProfile: Joi.object({
    fullName: Joi.string().min(2).max(100).optional(),
    phoneNumber: Joi.string().pattern(/^\+?[\d\s-]{10,20}$/).optional().messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
    bio: Joi.string().max(500).optional(),
    preferredStudyTime: Joi.string().valid('morning', 'afternoon', 'evening', 'night').optional(),
    nclexType: Joi.string().valid('RN', 'PN').optional(),
    examDate: Joi.date().greater('now').optional().messages({
      'date.greater': 'Exam date must be in the future'
    }),
    targetScore: Joi.number().min(0).max(100).optional(),
    goals: Joi.array().items(Joi.string().max(200)).max(10).optional(),
    weakAreas: Joi.array().items(Joi.number()).optional()
  })
};

// Generic validation middleware factory
export function validate(schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      ResponseHandler.error(
        res,
        errorCodes.VAL_INVALID_INPUT,
        'Validation failed',
        400,
        { errors }
      );
      return;
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
}

// Specific validation middlewares
export const validateRegister = validate(authSchemas.register);
export const validateLogin = validate(authSchemas.login);
export const validateRefreshToken = validate(authSchemas.refreshToken);
export const validateForgotPassword = validate(authSchemas.forgotPassword);
export const validateResetPassword = validate(authSchemas.resetPassword);
export const validateChangePassword = validate(authSchemas.changePassword);
export const validateVerifyEmail = validate(authSchemas.verifyEmail);
export const validateUpdateProfile = validate(authSchemas.updateProfile);
