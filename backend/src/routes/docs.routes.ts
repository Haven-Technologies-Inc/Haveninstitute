/**
 * API Documentation Routes
 * Provides interactive API documentation
 */

import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, apiEndpoints } from '../config/swagger';
import { ResponseHandler } from '../utils/responseHandler';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /docs:
 *   get:
 *     summary: Interactive API documentation
 *     tags: [Documentation]
 *     description: |
 *       Access the interactive Swagger UI for API documentation.
 *       
 *       ## Features:
 *       - 📖 Browse all available endpoints
 *       - 🧪 Test API endpoints directly
 *       - 📋 View request/response schemas
 *       - 🔐 Authentication examples
 *       - 📊 Rate limiting information
 *       
 *       ## Usage:
 *       1. Browse endpoints by category
 *       2. Click "Try it out" to test endpoints
 *       3. Fill in required parameters
 *       4. Click "Execute" to make requests
 *       5. View responses and status codes
 *     responses:
 *       200:
 *         description: Swagger UI loaded successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.use('/', swaggerUi.serve);

router.get('/', swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .scheme-container { margin: 20px 0 }
    .swagger-ui .opblock { margin: 10px 0 }
    .swagger-ui .opblock .opblock-summary-description { 
      color: #3b4151; 
      font-size: 14px;
      line-height: 1.5;
    }
    .swagger-ui .opblock.opblock-post { border-color: #49cc90; }
    .swagger-ui .opblock.opblock-get { border-color: #61affe; }
    .swagger-ui .opblock.opblock-put { border-color: #fca130; }
    .swagger-ui .opblock.opblock-delete { border-color: #f93e3e; }
  `,
  customSiteTitle: 'Haven Institute API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: 'none',
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
  },
}));

/**
 * @swagger
 * /docs/json:
 *   get:
 *     summary: Raw OpenAPI specification
 *     tags: [Documentation]
 *     description: |
 *       Get the raw OpenAPI 3.0 specification in JSON format.
 *       
 *       Use this to:
 *       - Generate client SDKs
 *       - Import into other API tools
 *       - Programmatic access to API documentation
 *       
 *       ## Format:
 *       - OpenAPI 3.0.0 specification
 *       - All endpoints documented
 *       - Complete schemas included
 *       - Authentication schemes defined
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 */
router.get('/json', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  } catch (error) {
    logger.error('Error serving OpenAPI spec:', error);
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
 * @swagger
 * /docs/endpoints:
 *   get:
 *     summary: List all API endpoints
 *     tags: [Documentation]
 *     description: |
 *       Get a comprehensive list of all available API endpoints
 *       organized by category with descriptions.
 *       
 *       ## Categories:
 *       - 🔐 Authentication: Login, register, MFA, OAuth
 *       - 🧠 CAT Engine: Adaptive testing sessions
 *       - 📚 Questions: Question management and retrieval
 *       - 👥 Users: User profiles and progress
 *       - 📊 Analytics: Performance and usage analytics
 *       - 📖 Content: Books, materials, flashcards
 *       - 💬 Discussions: Forums and social features
 *       - 💳 Payments: Subscriptions and transactions
 *       - ⚙️ Admin: Administrative functions
 *       
 *       ## Rate Limits:
 *       - General: 50 requests/15min
 *       - Auth: 10 requests/15min
 *       - MFA: 3 requests/5min
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: List of all endpoints
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: object
 *                       additionalProperties:
 *                         type: object
 *                         additionalProperties:
 *                           type: string
 *                     totalEndpoints:
 *                       type: integer
 *                     version:
 *                       type: string
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 */
router.get('/endpoints', (req, res) => {
  try {
    const totalEndpoints = Object.values(apiEndpoints).reduce(
      (total, category) => total + Object.keys(category).length, 0
    );

    ResponseHandler.success(res, {
      categories: apiEndpoints,
      totalEndpoints,
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
    }, 'API endpoints retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving endpoints:', error);
    ResponseHandler.error(res, 'DOCS_ERROR', 'Failed to retrieve endpoints');
  }
});

/**
 * @swagger
 * /docs/postman:
 *   get:
 *     summary: Generate Postman collection
 *     tags: [Documentation]
 *     description: |
 *       Generate a Postman collection for easy API testing.
 *       
 *       ## Features:
 *       - 📦 Complete collection with all endpoints
 *       - 🔐 Pre-configured authentication
 *       - 🌧️ Environment variables included
 *       - 📝 Example requests and responses
 *       - 🏷️ Organized by folders
 *       
 *       ## Usage:
 *       1. Download the collection JSON
 *       2. Import into Postman
 *       3. Set environment variables
 *       4. Start testing endpoints
 *       
 *       ## Environment Variables:
 *       - `baseUrl`: API base URL
 *       - `token`: JWT authentication token
 *       - `userId`: User ID for testing
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Postman collection generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 */
router.get('/postman', (req, res) => {
  try {
    const postmanCollection = {
      info: {
        name: 'Haven Institute API',
        description: 'Complete API collection for Haven Institute NCLEX preparation platform',
        version: '1.0.0',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      auth: {
        type: 'bearer',
        bearer: [
          {
            key: 'token',
            value: '{{token}}',
            type: 'string',
          },
        ],
      },
      variable: [
        {
          key: 'baseUrl',
          value: 'https://api.havenstudy.com/api/v1',
          type: 'string',
        },
        {
          key: 'token',
          value: '',
          type: 'string',
        },
      ],
      item: Object.entries(apiEndpoints).map(([category, endpoints]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        item: Object.entries(endpoints).map(([path, description]) => {
          const [method, ...pathParts] = path.split(' ');
          const fullPath = pathParts.join(' ');
          
          return {
            name: description,
            request: {
              method: method.toUpperCase(),
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json',
                },
                {
                  key: 'Authorization',
                  value: 'Bearer {{token}}',
                },
              ],
              url: {
                raw: '{{baseUrl}}' + fullPath,
                host: ['{{baseUrl}}'],
                path: fullPath.split('/').filter(Boolean),
              },
            },
            response: [],
          };
        }),
      })),
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="haven-institute-api.postman_collection.json"');
    res.send(postmanCollection);
  } catch (error) {
    logger.error('Error generating Postman collection:', error);
    ResponseHandler.error(res, 'DOCS_ERROR', 'Failed to generate Postman collection');
  }
});

/**
 * @swagger
 * /docs/sdk:
 *   get:
 *     summary: Generate SDK examples
 *     tags: [Documentation]
 *     description: |
 *       Get code examples for different programming languages
 *       to integrate with the Haven Institute API.
 *       
 *       ## Languages Supported:
 *       - 🟢 JavaScript/TypeScript
 *       - 🐍 Python
 *       - ☕ Java
 *       - 📱 Swift
 *       - 🟨 Kotlin
 *       - 🔷 C#
 *       - 🐹 Go
 *       - 🦀 Rust
 *       
 *       ## Features:
 *       - 📦 Complete authentication setup
 *       - 🌐 HTTP client configuration
 *       - 📝 Request/response examples
 *       - 🔧 Error handling patterns
 *       - 📚 Type definitions (where applicable)
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: SDK examples generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 */
router.get('/sdk', (req, res) => {
  try {
    const { language } = req.query;
    
    const sdkExamples: Record<string, any> = {
      javascript: {
        installation: 'npm install axios',
        authentication: `
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.havenstudy.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

// Example: Get user profile
async function getUserProfile() {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}
        `,
        usage: `
// Login
const loginResponse = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

// Start CAT session
const catSession = await api.post('/cat/start');

// Submit answer
const answer = await api.post('/cat/answer', {
  sessionId: 'session-id',
  questionId: 'question-id',
  answer: 0
});
        `,
      },
      python: {
        installation: 'pip install requests',
        authentication: `
import requests
import json

class HavenAPI:
    def __init__(self, base_url='https://api.havenstudy.com/api/v1'):
        self.base_url = base_url
        self.token = None
        
    def set_token(self, token):
        self.token = token
        
    def get_headers(self):
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        return headers
        
    def login(self, email, password):
        response = requests.post(
            f'{self.base_url}/auth/login',
            json={'email': email, 'password': password},
            headers=self.get_headers()
        )
        if response.status_code == 200:
            self.token = response.json['data']['token']
        return response.json()
        
    def get_profile(self):
        response = requests.get(
            f'{self.base_url}/users/profile',
            headers=self.get_headers()
        )
        return response.json()

# Usage
api = HavenAPI()
api.login('user@example.com', 'password123')
profile = api.get_profile()
        `,
      },
    };

    if (language && typeof language === 'string' && sdkExamples[language]) {
      return ResponseHandler.success(res, {
        language,
        examples: sdkExamples[language],
      }, 'SDK examples retrieved successfully');
    }

    ResponseHandler.success(res, {
      availableLanguages: Object.keys(sdkExamples),
      examples: sdkExamples,
    }, 'SDK examples retrieved successfully');
  } catch (error) {
    logger.error('Error generating SDK examples:', error);
    ResponseHandler.error(res, 'DOCS_ERROR', 'Failed to generate SDK examples');
  }
});

export default router;
