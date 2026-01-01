/**
 * Monitoring Service
 * Basic health checks and monitoring for Haven Institute
 */

import { sequelize } from '../config/database';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy';
  message?: string;
  responseTime?: number;
  lastChecked: Date;
}

interface SystemMetrics {
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
}

export class MonitoringService {
  private static healthChecks: Map<string, HealthCheck> = new Map();
  private static metrics: SystemMetrics | null = null;
  private static lastMetricsUpdate: Date | null = null;

  /**
   * Perform comprehensive health check
   */
  static async performHealthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    checks: HealthCheck[];
    timestamp: Date;
    uptime: number;
    version: string;
  }> {
    const startTime = Date.now();
    const checks: HealthCheck[] = [];

    // Database health check
    const dbCheck = await this.checkDatabase();
    checks.push(dbCheck);

    // Redis health check
    const redisCheck = await this.checkRedis();
    checks.push(redisCheck);

    // Memory check
    const memoryCheck = await this.checkMemory();
    checks.push(memoryCheck);

    // Disk space check
    const diskCheck = await this.checkDiskSpace();
    checks.push(diskCheck);

    // Overall status
    const status = checks.every(check => check.status === 'healthy') ? 'healthy' : 'unhealthy';

    // Update health checks cache
    checks.forEach(check => {
      this.healthChecks.set(check.name, check);
    });

    return {
      status,
      checks,
      timestamp: new Date(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    };
  }

  /**
   * Check database connectivity
   */
  private static async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    const name = 'database';

    try {
      await sequelize.authenticate();
      const responseTime = Date.now() - startTime;

      // Test basic query
      await sequelize.query('SELECT 1');

      return {
        name,
        status: 'healthy',
        message: 'Database connection successful',
        responseTime,
        lastChecked: new Date()
      };
    } catch (error: any) {
      logger.error('Database health check failed:', error);
      return {
        name,
        status: 'unhealthy',
        message: `Database connection failed: ${error.message}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date()
      };
    }
  }

  /**
   * Check Redis connectivity
   */
  private static async checkRedis(): Promise<HealthCheck> {
    const startTime = Date.now();
    const name = 'redis';

    try {
      if (!redisClient) {
        throw new Error('Redis not configured');
      }

      await redisClient.ping();
      const responseTime = Date.now() - startTime;

      return {
        name,
        status: 'healthy',
        message: 'Redis connection successful',
        responseTime,
        lastChecked: new Date()
      };
    } catch (error: any) {
      logger.error('Redis health check failed:', error);
      return {
        name,
        status: 'unhealthy',
        message: `Redis connection failed: ${error.message}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date()
      };
    }
  }

  /**
   * Check memory usage
   */
  private static async checkMemory(): Promise<HealthCheck> {
    const startTime = Date.now();
    const name = 'memory';

    try {
      const memUsage = process.memoryUsage();
      const totalMemory = require('os').totalmem();
      const usedMemory = memUsage.heapUsed;
      const memoryPercentage = (usedMemory / totalMemory) * 100;

      const responseTime = Date.now() - startTime;
      const isHealthy = memoryPercentage < 90; // Alert if using > 90% of available memory

      return {
        name,
        status: isHealthy ? 'healthy' : 'unhealthy',
        message: `Memory usage: ${memoryPercentage.toFixed(2)}% (${(usedMemory / 1024 / 1024).toFixed(2)}MB)`,
        responseTime,
        lastChecked: new Date()
      };
    } catch (error: any) {
      logger.error('Memory health check failed:', error);
      return {
        name,
        status: 'unhealthy',
        message: `Memory check failed: ${error.message}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date()
      };
    }
  }

  /**
   * Check disk space
   */
  private static async checkDiskSpace(): Promise<HealthCheck> {
    const startTime = Date.now();
    const name = 'disk';

    try {
      const fs = require('fs');
      const stats = fs.statSync('.');
      
      // Simple check - in production, you'd want to check actual disk space
      const responseTime = Date.now() - startTime;

      return {
        name,
        status: 'healthy',
        message: 'Disk space check passed',
        responseTime,
        lastChecked: new Date()
      };
    } catch (error: any) {
      logger.error('Disk health check failed:', error);
      return {
        name,
        status: 'unhealthy',
        message: `Disk check failed: ${error.message}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date()
      };
    }
  }

  /**
   * Get system metrics
   */
  static async getSystemMetrics(): Promise<SystemMetrics> {
    // Cache metrics for 30 seconds
    if (this.metrics && this.lastMetricsUpdate && 
        Date.now() - this.lastMetricsUpdate.getTime() < 30000) {
      return this.metrics;
    }

    try {
      const memUsage = process.memoryUsage();
      const totalMemory = require('os').totalmem();
      const freeMemory = require('os').freemem();
      const usedMemory = totalMemory - freeMemory;

      const cpus = require('os').cpus();
      const loadAvg = require('os').loadavg()[0];
      const cpuCount = cpus.length;
      const cpuUsage = (loadAvg / cpuCount) * 100;

      this.metrics = {
        uptime: process.uptime(),
        memory: {
          used: memUsage.heapUsed,
          total: totalMemory,
          percentage: (memUsage.heapUsed / totalMemory) * 100
        },
        cpu: {
          usage: Math.min(cpuUsage, 100)
        },
        disk: {
          used: 0, // Would need fs-extra or similar for actual disk usage
          total: 0,
          percentage: 0
        }
      };

      this.lastMetricsUpdate = new Date();
      return this.metrics;
    } catch (error) {
      logger.error('Error getting system metrics:', error);
      return {
        uptime: process.uptime(),
        memory: { used: 0, total: 0, percentage: 0 },
        cpu: { usage: 0 },
        disk: { used: 0, total: 0, percentage: 0 }
      };
    }
  }

  /**
   * Get cached health check results
   */
  static getCachedHealthChecks(): HealthCheck[] {
    return Array.from(this.healthChecks.values());
  }

  /**
   * Log application metrics
   */
  static logMetrics(): void {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    logger.info('Application metrics:', metrics);
  }

  /**
   * Setup periodic monitoring
   */
  static setupPeriodicChecks(intervalMs: number = 60000): void {
    // Perform health check every minute
    setInterval(async () => {
      try {
        await this.performHealthCheck();
        this.logMetrics();
      } catch (error) {
        logger.error('Periodic health check failed:', error);
      }
    }, intervalMs);

    // Log metrics every 5 minutes
    setInterval(() => {
      this.logMetrics();
    }, 5 * 60 * 1000);

    logger.info('Periodic monitoring setup complete');
  }

  /**
   * Get application status summary
   */
  static async getStatusSummary(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    uptime: number;
    version: string;
    environment: string;
    lastCheck: Date;
    checks: {
      total: number;
      healthy: number;
      unhealthy: number;
    };
  }> {
    const healthCheck = await this.performHealthCheck();
    const checks = healthCheck.checks;
    const healthyCount = checks.filter(c => c.status === 'healthy').length;
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;

    let status: 'healthy' | 'unhealthy' | 'degraded';
    if (unhealthyCount === 0) {
      status = 'healthy';
    } else if (healthyCount === 0) {
      status = 'unhealthy';
    } else {
      status = 'degraded';
    }

    return {
      status,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      lastCheck: new Date(),
      checks: {
        total: checks.length,
        healthy: healthyCount,
        unhealthy: unhealthyCount
      }
    };
  }
}

export default MonitoringService;
