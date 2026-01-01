/**
 * Health Routes
 * Health check endpoints for monitoring and load balancers
 */

import { Router, Request, Response } from 'express';
import { MonitoringService } from '../services/monitoring.service';
import { ResponseHandler } from '../utils/response';

const router = Router();

/**
 * Basic health check - lightweight for load balancers
 * GET /api/v1/health
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const healthCheck = await MonitoringService.performHealthCheck();
    
    if (healthCheck.status === 'healthy') {
      res.status(200).json({
        status: 'healthy',
        timestamp: healthCheck.timestamp,
        uptime: healthCheck.uptime
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: healthCheck.timestamp,
        uptime: healthCheck.uptime,
        checks: healthCheck.checks.filter(c => c.status === 'unhealthy').map(c => ({
          name: c.name,
          message: c.message
        }))
      });
    }
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * Detailed health check - for monitoring systems
 * GET /api/v1/health/detailed
 */
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const healthCheck = await MonitoringService.performHealthCheck();
    const metrics = await MonitoringService.getSystemMetrics();
    
    const detailedHealth = {
      ...healthCheck,
      metrics,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };
    
    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(detailedHealth);
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * Readiness check - for Kubernetes
 * GET /api/v1/health/ready
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    const healthCheck = await MonitoringService.performHealthCheck();
    const dbCheck = healthCheck.checks.find(c => c.name === 'database');
    const redisCheck = healthCheck.checks.find(c => c.name === 'redis');
    
    const isReady = dbCheck?.status === 'healthy' && 
                   (!redisCheck || redisCheck.status === 'healthy');
    
    if (isReady) {
      res.status(200).json({ 
        ready: true,
        checks: healthCheck.checks.map(c => ({
          name: c.name,
          status: c.status
        }))
      });
    } else {
      res.status(503).json({ 
        ready: false,
        reason: 'Dependencies not ready',
        checks: healthCheck.checks.map(c => ({
          name: c.name,
          status: c.status,
          message: c.message
        }))
      });
    }
  } catch (error: any) {
    res.status(503).json({ 
      ready: false, 
      reason: error.message 
    });
  }
});

/**
 * Liveness check - for Kubernetes
 * GET /api/v1/health/live
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({ 
    alive: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * System metrics endpoint
 * GET /api/v1/health/metrics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await MonitoringService.getSystemMetrics();
    const status = await MonitoringService.getStatusSummary();
    
    res.status(200).json({
      ...metrics,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Component health check
 * GET /api/v1/health/components
 */
router.get('/components', async (req: Request, res: Response) => {
  try {
    const healthCheck = await MonitoringService.performHealthCheck();
    
    res.status(200).json({
      components: healthCheck.checks,
      overall: healthCheck.status,
      timestamp: healthCheck.timestamp
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
