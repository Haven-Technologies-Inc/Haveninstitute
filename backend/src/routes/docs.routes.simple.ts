/**
 * Simple API Documentation Routes
 * Provides basic API documentation without complex dependencies
 */

import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';

const router = Router();

/**
 * API Documentation - Swagger UI
 */
router.use('/', swaggerUi.serve);

router.get('/', swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'Haven Institute API Documentation',
}));

/**
 * Raw OpenAPI Specification
 */
router.get('/json', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DOCS_ERROR',
        message: 'Failed to generate API documentation',
      },
    });
  }
});

/**
 * API Endpoints List
 */
router.get('/endpoints', (req, res) => {
  try {
    const endpoints = {
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
      analytics: {
        'GET /analytics/overview': 'Get analytics overview',
        'GET /analytics/performance': 'Get performance metrics',
        'GET /analytics/progress': 'Get progress analytics',
        'GET /analytics/usage': 'Get usage statistics',
      },
    };

    res.status(200).json({
      success: true,
      data: {
        categories: endpoints,
        totalEndpoints: Object.values(endpoints).reduce(
          (total, category) => total + Object.keys(category).length, 0
        ),
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
      },
      message: 'API endpoints retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DOCS_ERROR',
        message: 'Failed to retrieve endpoints',
      },
    });
  }
});

export default router;
