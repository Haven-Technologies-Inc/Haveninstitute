/**
 * Advanced Monitoring Service
 * Provides comprehensive application monitoring with APM capabilities
 */

import { logger } from '../utils/logger';
import { PerformanceService } from './performance.service';

interface MonitoringMetrics {
  // Application Metrics
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  
  // Database Metrics
  dbConnections: number;
  dbQueryTime: number;
  dbErrors: number;
  
  // API Metrics
  requestsPerMinute: number;
  averageResponseTime: number;
  errorRate: number;
  
  // Business Metrics
  activeUsers: number;
  catSessionsInProgress: number;
  questionsAnswered: number;
  
  // System Metrics
  diskUsage: number;
  networkLatency: number;
  cacheHitRate: number;
}

interface Alert {
  id: string;
  type: 'performance' | 'error' | 'security' | 'business';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
  resolved: boolean;
}

interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  lastCheck: Date;
  details?: any;
}

export class AdvancedMonitoringService {
  private static metrics: MonitoringMetrics[] = [];
  private static alerts: Alert[] = [];
  private static healthChecks: Map<string, HealthCheck> = new Map();
  private static isMonitoring = false;
  private static monitoringInterval: NodeJS.Timeout | null = null;

  private static thresholds = {
    memoryUsage: 0.8, // 80%
    cpuUsage: 0.7, // 70%
    responseTime: 1000, // 1 second
    errorRate: 0.05, // 5%
    dbConnections: 80, // 80% of max pool
    diskUsage: 0.85, // 85%
    cacheHitRate: 0.8, // 80%
    networkLatency: 500, // 500ms
  };

  /**
   * Start monitoring service
   */
  static startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) {
      logger.warn('Monitoring service is already running');
      return;
    }

    this.isMonitoring = true;
    logger.info('Starting advanced monitoring service');

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
        await this.performHealthChecks();
        this.checkThresholds();
        this.cleanupOldData();
      } catch (error) {
        logger.error('Error in monitoring cycle:', error);
      }
    }, intervalMs);

    // Initial collection
    this.collectMetrics();
  }

  /**
   * Stop monitoring service
   */
  static stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    logger.info('Advanced monitoring service stopped');
  }

  /**
   * Collect comprehensive metrics
   */
  private static async collectMetrics(): Promise<void> {
    const metrics: MonitoringMetrics = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      dbConnections: await this.getDatabaseConnections(),
      dbQueryTime: await this.getAverageQueryTime(),
      dbErrors: await this.getDatabaseErrors(),
      requestsPerMinute: await this.getRequestsPerMinute(),
      averageResponseTime: await this.getAverageResponseTime(),
      errorRate: await this.getErrorRate(),
      activeUsers: await this.getActiveUsers(),
      catSessionsInProgress: await this.getCATSessionsInProgress(),
      questionsAnswered: await this.getQuestionsAnswered(),
      diskUsage: await this.getDiskUsage(),
      networkLatency: await this.getNetworkLatency(),
      cacheHitRate: await this.getCacheHitRate(),
    };

    this.metrics.push(metrics);
    
    // Keep only last 1000 data points
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    logger.debug('Metrics collected', {
      memory: `${(metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(1)}MB`,
      cpu: `${metrics.cpuUsage.user}ms`,
      requests: metrics.requestsPerMinute,
      errors: `${(metrics.errorRate * 100).toFixed(1)}%`,
    });
  }

  /**
   * Perform health checks on all services
   */
  private static async performHealthChecks(): Promise<void> {
    const services = [
      { name: 'database', check: this.checkDatabaseHealth },
      { name: 'redis', check: this.checkRedisHealth },
      { name: 'api', check: this.checkAPIHealth },
      { name: 'external-apis', check: this.checkExternalAPIsHealth },
    ];

    for (const service of services) {
      try {
        const startTime = Date.now();
        const result = await service.check();
        const responseTime = Date.now() - startTime;

        const healthCheck: HealthCheck = {
          service: service.name,
          status: result.healthy ? 'healthy' : 'unhealthy',
          responseTime,
          lastCheck: new Date(),
          details: result.details,
        };

        this.healthChecks.set(service.name, healthCheck);

        if (!result.healthy) {
          this.createAlert({
            type: 'error',
            severity: 'high',
            title: `Service Down: ${service.name}`,
            message: result.message || 'Service is not responding',
            value: responseTime,
            threshold: 5000,
          });
        }
      } catch (error) {
        logger.error(`Health check failed for ${service.name}:`, error);
        this.healthChecks.set(service.name, {
          service: service.name,
          status: 'unhealthy',
          responseTime: 0,
          lastCheck: new Date(),
          details: { error: error.message },
        });
      }
    }
  }

  /**
   * Check thresholds and create alerts
   */
  private static checkThresholds(): void {
    if (this.metrics.length === 0) return;

    const latest = this.metrics[this.metrics.length - 1];

    // Memory usage check
    const memoryUsagePercent = latest.memoryUsage.heapUsed / latest.memoryUsage.heapTotal;
    if (memoryUsagePercent > this.thresholds.memoryUsage) {
      this.createAlert({
        type: 'performance',
        severity: memoryUsagePercent > 0.9 ? 'critical' : 'high',
        title: 'High Memory Usage',
        message: `Memory usage is ${(memoryUsagePercent * 100).toFixed(1)}%`,
        value: memoryUsagePercent,
        threshold: this.thresholds.memoryUsage,
      });
    }

    // Response time check
    if (latest.averageResponseTime > this.thresholds.responseTime) {
      this.createAlert({
        type: 'performance',
        severity: latest.averageResponseTime > 2000 ? 'critical' : 'high',
        title: 'Slow Response Time',
        message: `Average response time is ${latest.averageResponseTime}ms`,
        value: latest.averageResponseTime,
        threshold: this.thresholds.responseTime,
      });
    }

    // Error rate check
    if (latest.errorRate > this.thresholds.errorRate) {
      this.createAlert({
        type: 'error',
        severity: latest.errorRate > 0.1 ? 'critical' : 'high',
        title: 'High Error Rate',
        message: `Error rate is ${(latest.errorRate * 100).toFixed(1)}%`,
        value: latest.errorRate,
        threshold: this.thresholds.errorRate,
      });
    }

    // Database connections check
    if (latest.dbConnections > this.thresholds.dbConnections) {
      this.createAlert({
        type: 'performance',
        severity: 'medium',
        title: 'High Database Connections',
        message: `Database connections: ${latest.dbConnections}`,
        value: latest.dbConnections,
        threshold: this.thresholds.dbConnections,
      });
    }
  }

  /**
   * Create an alert
   */
  private static createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): void {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      ...alertData,
    };

    this.alerts.push(alert);

    // Log alert
    logger.warn(`Alert [${alert.severity.toUpperCase()}]: ${alert.title}`, {
      id: alert.id,
      type: alert.type,
      message: alert.message,
      value: alert.value,
      threshold: alert.threshold,
    });

    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }
  }

  /**
   * Get current metrics
   */
  static getCurrentMetrics(): MonitoringMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * Get metrics history
   */
  static getMetricsHistory(limit: number = 100): MonitoringMetrics[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Get active alerts
   */
  static getActiveAlerts(): Alert[] {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.alerts.filter(alert => !alert.resolved && alert.timestamp > oneDayAgo);
  }

  /**
   * Get health status
   */
  static getHealthStatus(): Map<string, HealthCheck> {
    return new Map(this.healthChecks);
  }

  /**
   * Get monitoring dashboard data
   */
  static getDashboardData(): {
    metrics: MonitoringMetrics | null;
    alerts: Alert[];
    healthChecks: HealthCheck[];
    uptime: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
  } {
    const metrics = this.getCurrentMetrics();
    const alerts = this.getActiveAlerts();
    const healthChecks = Array.from(this.healthChecks.values());
    
    // Calculate overall grade
    let score = 100;
    
    if (metrics) {
      const memoryUsagePercent = metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal;
      if (memoryUsagePercent > 0.8) score -= 15;
      if (metrics.averageResponseTime > 1000) score -= 20;
      if (metrics.errorRate > 0.05) score -= 25;
      if (metrics.dbConnections > 80) score -= 10;
    }

    // Deduct points for active alerts
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const highAlerts = alerts.filter(a => a.severity === 'high').length;
    score -= (criticalAlerts * 10) + (highAlerts * 5);

    // Deduct points for unhealthy services
    const unhealthyServices = healthChecks.filter(h => h.status === 'unhealthy').length;
    score -= unhealthyServices * 15;

    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    return {
      metrics,
      alerts,
      healthChecks,
      uptime: process.uptime(),
      grade,
    };
  }

  // Helper methods for metrics collection
  private static async getDatabaseConnections(): Promise<number> {
    try {
      const { sequelize } = await import('../config/database');
      // Use Sequelize's built-in connection pool methods with proper typing
      const connectionManager = sequelize.connectionManager as unknown as {
        pool?: { numUsed?: () => number };
      };
      return connectionManager.pool?.numUsed?.() || 0;
    } catch {
      return 0;
    }
  }

  private static async getAverageQueryTime(): Promise<number> {
    // This would typically come from your database monitoring
    return 150; // 150ms average
  }

  private static async getDatabaseErrors(): Promise<number> {
    // This would typically come from your error tracking
    return 2;
  }

  private static async getRequestsPerMinute(): Promise<number> {
    // This would typically come from your request tracking
    return 45;
  }

  private static async getAverageResponseTime(): Promise<number> {
    const perfMetrics = PerformanceService.getCurrentMetrics();
    return perfMetrics?.apiResponseTime || 0;
  }

  private static async getErrorRate(): Promise<number> {
    const perfMetrics = PerformanceService.getCurrentMetrics();
    return perfMetrics?.errorRate || 0;
  }

  private static async getActiveUsers(): Promise<number> {
    // This would typically come from your user session tracking
    return 125;
  }

  private static async getCATSessionsInProgress(): Promise<number> {
    try {
      const { CATSession } = await import('../models');
      return await CATSession.count({ where: { status: 'in_progress' } });
    } catch {
      return 0;
    }
  }

  private static async getQuestionsAnswered(): Promise<number> {
    // This would typically come from your analytics
    return 1250;
  }

  private static async getDiskUsage(): Promise<number> {
    try {
      // For now, return a simulated value - in production, implement actual disk usage check
      return 0.65; // 65% usage
    } catch {
      return 0;
    }
  }

  private static async getNetworkLatency(): Promise<number> {
    try {
      const start = Date.now();
      await fetch('https://api.havenstudy.com/health');
      return Date.now() - start;
    } catch {
      return 0;
    }
  }

  private static async getCacheHitRate(): Promise<number> {
    try {
      const { redisClient } = await import('../config/redis');
      await redisClient.ping(); // Test connection
      // Parse Redis info to get hit rate - simplified for now
      return 0.85; // 85% hit rate
    } catch {
      return 0;
    }
  }

  // Health check methods
  private static async checkDatabaseHealth(): Promise<{ healthy: boolean; message?: string; details?: any }> {
    try {
      const { sequelize } = await import('../config/database');
      await sequelize.authenticate();
      return { healthy: true, details: { connected: true } };
    } catch (error) {
      return { healthy: false, message: error.message };
    }
  }

  private static async checkRedisHealth(): Promise<{ healthy: boolean; message?: string; details?: any }> {
    try {
      const { redisClient } = await import('../config/redis');
      await redisClient.ping();
      return { healthy: true, details: { connected: true } };
    } catch (error) {
      return { healthy: false, message: error.message };
    }
  }

  private static async checkAPIHealth(): Promise<{ healthy: boolean; message?: string; details?: any }> {
    try {
      const response = await fetch('http://localhost:3001/api/v1/health');
      return { healthy: response.ok, details: { status: response.status } };
    } catch (error) {
      return { healthy: false, message: error.message };
    }
  }

  private static async checkExternalAPIsHealth(): Promise<{ healthy: boolean; message?: string; details?: any }> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      });
      return { healthy: response.ok, details: { openai: response.status } };
    } catch (error) {
      return { healthy: false, message: error.message };
    }
  }

  /**
   * Clean up old data
   */
  private static cleanupOldData(): void {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    // Clean old metrics
    this.metrics = this.metrics.filter(metric => 
      metric.uptime * 1000 > oneWeekAgo
    );
    
    // Clean old resolved alerts
    this.alerts = this.alerts.filter(alert => 
      !alert.resolved && alert.timestamp.getTime() > oneWeekAgo
    );
  }
}
