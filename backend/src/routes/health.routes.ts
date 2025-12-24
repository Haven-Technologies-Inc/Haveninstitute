/**
 * Enhanced Health Check Routes
 * Provides detailed system health information for monitoring
 */

import { Router, Request, Response } from 'express';
import { sequelize } from '../config/database';
import os from 'os';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: ServiceCheck;
    memory: ServiceCheck;
    disk?: ServiceCheck;
  };
  system?: SystemInfo;
}

interface ServiceCheck {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  message?: string;
}

interface SystemInfo {
  platform: string;
  nodeVersion: string;
  cpuUsage: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  loadAverage: number[];
}

/**
 * Basic health check - lightweight for load balancers
 * GET /api/v1/health
 */
router.get('/', async (req: Request, res: Response) => {
  const dbHealthy = await checkDatabase();
  
  if (dbHealthy.status === 'up') {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

/**
 * Detailed health check - for monitoring systems
 * GET /api/v1/health/detailed
 */
router.get('/detailed', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  // Run all checks in parallel
  const [dbCheck, memoryCheck] = await Promise.all([
    checkDatabase(),
    checkMemory()
  ]);
  
  const checks = {
    database: dbCheck,
    memory: memoryCheck
  };
  
  // Determine overall status
  const allUp = Object.values(checks).every(c => c.status === 'up');
  const anyDown = Object.values(checks).some(c => c.status === 'down');
  
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  if (allUp) {
    overallStatus = 'healthy';
  } else if (anyDown) {
    overallStatus = 'unhealthy';
  } else {
    overallStatus = 'degraded';
  }
  
  const healthStatus: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks,
    system: getSystemInfo()
  };
  
  const statusCode = overallStatus === 'healthy' ? 200 : 
                     overallStatus === 'degraded' ? 200 : 503;
  
  res.status(statusCode).json(healthStatus);
});

/**
 * Readiness check - for Kubernetes
 * GET /api/v1/health/ready
 */
router.get('/ready', async (req: Request, res: Response) => {
  const dbCheck = await checkDatabase();
  
  if (dbCheck.status === 'up') {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false, reason: 'Database not ready' });
  }
});

/**
 * Liveness check - for Kubernetes
 * GET /api/v1/health/live
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({ alive: true });
});

// Helper functions

async function checkDatabase(): Promise<ServiceCheck> {
  const startTime = Date.now();
  try {
    await sequelize.authenticate();
    const latency = Date.now() - startTime;
    
    return {
      status: latency > 1000 ? 'degraded' : 'up',
      latency,
      message: latency > 1000 ? 'High latency detected' : 'Connected'
    };
  } catch (error) {
    return {
      status: 'down',
      latency: Date.now() - startTime,
      message: error instanceof Error ? error.message : 'Connection failed'
    };
  }
}

function checkMemory(): Promise<ServiceCheck> {
  const used = process.memoryUsage();
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
  const percentage = Math.round((used.heapUsed / used.heapTotal) * 100);
  
  let status: 'up' | 'degraded' | 'down' = 'up';
  let message = `${heapUsedMB}MB / ${heapTotalMB}MB (${percentage}%)`;
  
  if (percentage > 90) {
    status = 'down';
    message = 'Critical: Memory usage above 90%';
  } else if (percentage > 75) {
    status = 'degraded';
    message = 'Warning: Memory usage above 75%';
  }
  
  return Promise.resolve({ status, message });
}

function getSystemInfo(): SystemInfo {
  const cpus = os.cpus();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  
  // Calculate CPU usage (simplified)
  const cpuUsage = cpus.reduce((acc, cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    const idle = cpu.times.idle;
    return acc + ((total - idle) / total) * 100;
  }, 0) / cpus.length;
  
  return {
    platform: os.platform(),
    nodeVersion: process.version,
    cpuUsage: Math.round(cpuUsage * 100) / 100,
    memoryUsage: {
      used: Math.round(usedMemory / 1024 / 1024),
      total: Math.round(totalMemory / 1024 / 1024),
      percentage: Math.round((usedMemory / totalMemory) * 100)
    },
    loadAverage: os.loadavg().map(l => Math.round(l * 100) / 100)
  };
}

export default router;
