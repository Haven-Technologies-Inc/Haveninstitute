import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import crypto from 'crypto';
import 'express-async-errors';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN?.split(',') || [];
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Production domains only
const productionDomains = [
  'https://havenstudy.com',
  'https://www.havenstudy.com',
  'https://api.havenstudy.com'
];

// Development domains - REMOVED FOR PRODUCTION SECURITY
const developmentDomains = [
  // Development domains removed for security
];

let allowedOrigins: string[];

if (isProduction) {
  // In production, only allow production domains
  allowedOrigins = [...new Set([...corsOrigins, ...productionDomains])];
  
  // Filter out any development domains in production
  allowedOrigins = allowedOrigins.filter(origin => 
    !developmentDomains.includes(origin) &&
    !origin.includes('localhost') &&
    !origin.includes('127.0.0.1')
  );
} else {
  // In development, allow all domains
  allowedOrigins = [...new Set([...corsOrigins, ...productionDomains, ...developmentDomains])];
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // In development, be more permissive
    if (isDevelopment) {
      return callback(null, true);
    }

    // In production, strictly validate origins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('CORS not allowed for this origin'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: isProduction ? 86400 : 3600, // Longer cache in production
  optionsSuccessStatus: 204 // Some legacy browsers choke on 204
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request ID and logging middleware
app.use((req: Request, res: Response, next) => {
  const requestId = crypto.randomBytes(8).toString('hex');
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`[${requestId}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });

  next();
});

// Rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, status: 'ok' });
});

// API routes
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}`, routes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Haven Institute API',
    version: apiVersion,
    documentation: `/api/${apiVersion}/docs`,
    health: `/api/${apiVersion}/health`
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
