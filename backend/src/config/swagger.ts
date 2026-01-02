/**
 * Swagger/OpenAPI Configuration
 * Generates comprehensive API documentation
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Haven Institute API',
    version: '1.0.0',
    description: `
      Comprehensive NCLEX preparation platform API
      
      ## Features
      - 🧠 Adaptive CAT Engine with IRT algorithm
      - 🔐 Multi-factor authentication & authorization
      - 📚 Content management (e-books, questions, flashcards)
      - 👥 Social features (discussions, study groups)
      - 💳 Payment processing & subscriptions
      - 📊 Analytics & progress tracking
      - 🤖 AI-powered content generation
      
      ## Authentication
      Most endpoints require JWT authentication. Include the token in the Authorization header:
      \`Authorization: Bearer <your-jwt-token>\`
      
      ## Rate Limiting
      API endpoints are rate-limited to prevent abuse:
      - General endpoints: 50 requests per 15 minutes
      - Authentication endpoints: 10 requests per 15 minutes
      - MFA endpoints: 3 requests per 5 minutes
      
      ## Error Handling
      All errors follow a consistent format:
      \`\`\`json
      {
        "success": false,
        "error": {
          "code": "ERROR_CODE",
          "message": "Human readable error message",
          "details": "Additional error details"
        }
      }
      \`\`\`
    `,
    contact: {
      name: 'Haven Institute API Support',
      email: 'api-support@havenstudy.com',
      url: 'https://havenstudy.com/support',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'https://api.havenstudy.com/api/v1',
      description: 'Production server',
    },
    {
      url: 'https://staging-api.havenstudy.com/api/v1',
      description: 'Staging server',
    },
    {
      url: 'http://localhost:3001/api/v1',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT authentication token',
      },
    },
    schemas: {
      User: {
        type: 'object',
        required: ['email', 'fullName'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique user identifier',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          fullName: {
            type: 'string',
            description: 'User full name',
          },
          role: {
            type: 'string',
            enum: ['student', 'instructor', 'editor', 'moderator', 'admin'],
            description: 'User role',
          },
          subscriptionTier: {
            type: 'string',
            enum: ['Free', 'Pro', 'Premium'],
            description: 'Subscription tier',
          },
          avatarUrl: {
            type: 'string',
            format: 'uri',
            description: 'Avatar image URL',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation date',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update date',
          },
        },
      },
      Question: {
        type: 'object',
        required: ['text', 'options', 'correctAnswer', 'category'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique question identifier',
          },
          text: {
            type: 'string',
            description: 'Question text',
          },
          options: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Answer options',
          },
          correctAnswer: {
            type: 'integer',
            minimum: 0,
            maximum: 3,
            description: 'Index of correct answer',
          },
          category: {
            type: 'string',
            description: 'NCLEX category',
          },
          difficulty: {
            type: 'number',
            minimum: -3,
            maximum: 3,
            description: 'IRT difficulty parameter',
          },
          discrimination: {
            type: 'number',
            description: 'IRT discrimination parameter',
          },
          guessing: {
            type: 'number',
            description: 'IRT guessing parameter',
          },
          bloomLevel: {
            type: 'string',
            enum: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'],
            description: "Bloom's taxonomy level",
          },
        },
      },
      CATSession: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique session identifier',
          },
          userId: {
            type: 'string',
            format: 'uuid',
            description: 'User ID',
          },
          status: {
            type: 'string',
            enum: ['in_progress', 'completed', 'abandoned'],
            description: 'Session status',
          },
          ability: {
            type: 'number',
            description: 'Current ability estimate',
          },
          questionsAnswered: {
            type: 'integer',
            description: 'Number of questions answered',
          },
          passingProbability: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description: 'Probability of passing',
          },
          startTime: {
            type: 'string',
            format: 'date-time',
            description: 'Session start time',
          },
          endTime: {
            type: 'string',
            format: 'date-time',
            description: 'Session end time',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['success', 'error'],
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: {
                type: 'string',
                description: 'Error code',
              },
              message: {
                type: 'string',
                description: 'Error message',
              },
              details: {
                type: 'string',
                description: 'Additional error details',
              },
            },
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            description: 'Response data',
          },
          message: {
            type: 'string',
            description: 'Success message',
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization',
    },
    {
      name: 'CAT Engine',
      description: 'Computerized Adaptive Testing engine',
    },
    {
      name: 'Questions',
      description: 'Question management and retrieval',
    },
    {
      name: 'Users',
      description: 'User management and profiles',
    },
    {
      name: 'Analytics',
      description: 'Analytics and progress tracking',
    },
    {
      name: 'Content',
      description: 'Content management (e-books, materials)',
    },
    {
      name: 'Discussions',
      description: 'Discussion forums and social features',
    },
    {
      name: 'Payments',
      description: 'Payment processing and subscriptions',
    },
    {
      name: 'Admin',
      description: 'Administrative functions',
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

// API Documentation Endpoints Summary
export const apiEndpoints = {
  authentication: {
    'POST /auth/register': 'Register new user',
    'POST /auth/login': 'User login',
    'POST /auth/logout': 'User logout',
    'POST /auth/refresh': 'Refresh JWT token',
    'POST /auth/forgot-password': 'Request password reset',
    'POST /auth/reset-password': 'Reset password',
    'POST /auth/verify-email': 'Verify email address',
    'POST /auth/mfa/setup': 'Setup MFA',
    'POST /auth/mfa/verify': 'Verify MFA code',
    'POST /auth/oauth/google': 'Google OAuth',
    'POST /auth/oauth/apple': 'Apple OAuth',
  },
  cat: {
    'POST /cat/start': 'Start CAT session',
    'POST /cat/answer': 'Submit answer',
    'GET /cat/status': 'Get session status',
    'POST /cat/finish': 'Finish CAT session',
    'GET /cat/results': 'Get CAT results',
    'GET /cat/history': 'Get CAT history',
  },
  questions: {
    'GET /questions': 'Get questions with filters',
    'GET /questions/:id': 'Get specific question',
    'POST /questions': 'Create question (admin)',
    'PUT /questions/:id': 'Update question (admin)',
    'DELETE /questions/:id': 'Delete question (admin)',
    'GET /questions/categories': 'Get question categories',
    'GET /questions/random': 'Get random questions',
  },
  users: {
    'GET /users/profile': 'Get user profile',
    'PUT /users/profile': 'Update user profile',
    'GET /users/progress': 'Get user progress',
    'GET /users/stats': 'Get user statistics',
    'POST /users/settings': 'Update user settings',
    'GET /users/achievements': 'Get user achievements',
  },
  analytics: {
    'GET /analytics/overview': 'Get analytics overview',
    'GET /analytics/performance': 'Get performance metrics',
    'GET /analytics/progress': 'Get progress analytics',
    'GET /analytics/usage': 'Get usage statistics',
  },
  content: {
    'GET /content/books': 'Get available books',
    'GET /content/books/:id': 'Get book details',
    'POST /content/books/:id/purchase': 'Purchase book',
    'GET /content/materials': 'Get study materials',
    'GET /content/flashcards': 'Get flashcards',
  },
  discussions: {
    'GET /discussions': 'Get discussion posts',
    'POST /discussions': 'Create discussion post',
    'GET /discussions/:id': 'Get discussion details',
    'PUT /discussions/:id': 'Update discussion post',
    'DELETE /discussions/:id': 'Delete discussion post',
    'POST /discussions/:id/comment': 'Add comment',
    'POST /discussions/:id/react': 'Add reaction',
  },
  payments: {
    'POST /payments/create-intent': 'Create payment intent',
    'POST /payments/confirm': 'Confirm payment',
    'GET /payments/subscriptions': 'Get subscription plans',
    'POST /payments/subscribe': 'Subscribe to plan',
    'GET /payments/history': 'Get payment history',
  },
  admin: {
    'GET /admin/users': 'Get all users',
    'GET /admin/analytics': 'Get admin analytics',
    'POST /admin/content/upload': 'Upload content',
    'GET /admin/settings': 'Get system settings',
    'PUT /admin/settings': 'Update system settings',
  },
};

export default swaggerSpec;
