/**
 * Performance Monitoring Service
 * Tracks application performance metrics and provides optimization insights
 */

import { logger } from '../utils/logger';

interface PerformanceMetrics {
  // API Performance
  apiResponseTime: number;
  databaseQueryTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  
  // Frontend Performance
  bundleSize: number;
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  
  // System Performance
  activeConnections: number;
  requestsPerSecond: number;
  errorRate: number;
}

interface PerformanceAlert {
  type: 'memory' | 'cpu' | 'response_time' | 'error_rate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

export class PerformanceService {
  private static metrics: Map<string, PerformanceMetrics> = new Map();
  private static alerts: PerformanceAlert[] = [];
  private static thresholds = {
    memoryUsage: 0.8, // 80% of available memory
    cpuUsage: 0.7, // 70% CPU usage
    responseTime: 1000, // 1 second
    errorRate: 0.05, // 5% error rate
    bundleSize: 1024 * 1024, // 1MB
    loadTime: 3000, // 3 seconds
  };

  /**
   * Collect current performance metrics
   */
  static async collectMetrics(): Promise<PerformanceMetrics> {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Simulate API response time measurement
    const apiResponseTime = await this.measureAPIResponseTime();
    
    // Simulate database query time
    const databaseQueryTime = await this.measureDatabaseQueryTime();
    
    const metrics: PerformanceMetrics = {
      apiResponseTime,
      databaseQueryTime,
      memoryUsage: memUsage,
      cpuUsage,
      bundleSize: await this.getBundleSize(),
      loadTime: await this.getAverageLoadTime(),
      firstContentfulPaint: await this.getFCPMetric(),
      largestContentfulPaint: await this.getLCPMetric(),
      activeConnections: this.getActiveConnections(),
      requestsPerSecond: this.getRequestsPerSecond(),
      errorRate: this.getErrorRate(),
    };

    this.metrics.set(Date.now().toString(), metrics);
    this.checkThresholds(metrics);
    
    return metrics;
  }

  /**
   * Measure API response time
   */
  private static async measureAPIResponseTime(): Promise<number> {
    const start = Date.now();
    try {
      // Simulate a simple health check
      await fetch('http://localhost:3001/api/v1/health');
      return Date.now() - start;
    } catch (error) {
      logger.warn('Failed to measure API response time', error);
      return 0;
    }
  }

  /**
   * Measure database query time
   */
  private static async measureDatabaseQueryTime(): Promise<number> {
    const start = Date.now();
    try {
      // Simulate a simple database query
      const { sequelize } = await import('../config/database');
      await sequelize.query('SELECT 1');
      return Date.now() - start;
    } catch (error) {
      logger.warn('Failed to measure database query time', error);
      return 0;
    }
  }

  /**
   * Get frontend bundle size
   */
  private static async getBundleSize(): Promise<number> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const buildPath = path.join(process.cwd(), 'build', 'assets');
      
      // Calculate total size of JS files
      const files = await fs.readdir(buildPath);
      let totalSize = 0;
      
      for (const file of files) {
        if (file.endsWith('.js')) {
          const stats = await fs.stat(path.join(buildPath, file));
          totalSize += stats.size;
        }
      }
      
      return totalSize;
    } catch (error) {
      logger.warn('Failed to get bundle size', error);
      return 0;
    }
  }

  /**
   * Get average load time from analytics
   */
  private static async getAverageLoadTime(): Promise<number> {
    // This would typically come from your analytics service
    // For now, return a simulated value
    return 2500; // 2.5 seconds
  }

  /**
   * Get First Contentful Paint metric
   */
  private static async getFCPMetric(): Promise<number> {
    // This would typically come from your frontend monitoring
    return 1800; // 1.8 seconds
  }

  /**
   * Get Largest Contentful Paint metric
   */
  private static async getLCPMetric(): Promise<number> {
    // This would typically come from your frontend monitoring
    return 3200; // 3.2 seconds
  }

  /**
   * Get active connections count
   */
  private static getActiveConnections(): number {
    // This would typically come from your server metrics
    return 150;
  }

  /**
   * Get requests per second
   */
  private static getRequestsPerSecond(): number {
    // This would typically come from your server metrics
    return 45;
  }

  /**
   * Get error rate
   */
  private static getErrorRate(): number {
    // This would typically come from your error tracking
    return 0.02; // 2%
  }

  /**
   * Check metrics against thresholds and create alerts
   */
  private static checkThresholds(metrics: PerformanceMetrics): void {
    const alerts: PerformanceAlert[] = [];

    // Check memory usage
    const memoryUsagePercent = metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal;
    if (memoryUsagePercent > this.thresholds.memoryUsage) {
      alerts.push({
        type: 'memory',
        severity: memoryUsagePercent > 0.9 ? 'critical' : 'high',
        message: `High memory usage: ${(memoryUsagePercent * 100).toFixed(1)}%`,
        value: memoryUsagePercent,
        threshold: this.thresholds.memoryUsage,
        timestamp: new Date(),
      });
    }

    // Check response time
    if (metrics.apiResponseTime > this.thresholds.responseTime) {
      alerts.push({
        type: 'response_time',
        severity: metrics.apiResponseTime > 2000 ? 'critical' : 'high',
        message: `Slow API response time: ${metrics.apiResponseTime}ms`,
        value: metrics.apiResponseTime,
        threshold: this.thresholds.responseTime,
        timestamp: new Date(),
      });
    }

    // Check bundle size
    if (metrics.bundleSize > this.thresholds.bundleSize) {
      alerts.push({
        type: 'response_time',
        severity: 'medium',
        message: `Large bundle size: ${(metrics.bundleSize / 1024 / 1024).toFixed(1)}MB`,
        value: metrics.bundleSize,
        threshold: this.thresholds.bundleSize,
        timestamp: new Date(),
      });
    }

    // Check load time
    if (metrics.loadTime > this.thresholds.loadTime) {
      alerts.push({
        type: 'response_time',
        severity: 'high',
        message: `Slow load time: ${metrics.loadTime}ms`,
        value: metrics.loadTime,
        threshold: this.thresholds.loadTime,
        timestamp: new Date(),
      });
    }

    // Check error rate
    if (metrics.errorRate > this.thresholds.errorRate) {
      alerts.push({
        type: 'error_rate',
        severity: metrics.errorRate > 0.1 ? 'critical' : 'high',
        message: `High error rate: ${(metrics.errorRate * 100).toFixed(1)}%`,
        value: metrics.errorRate,
        threshold: this.thresholds.errorRate,
        timestamp: new Date(),
      });
    }

    this.alerts.push(...alerts);
    
    // Log alerts
    alerts.forEach(alert => {
      logger.warn(`Performance Alert [${alert.severity.toUpperCase()}]: ${alert.message}`, {
        type: alert.type,
        value: alert.value,
        threshold: alert.threshold,
      });
    });
  }

  /**
   * Get current performance metrics
   */
  static getCurrentMetrics(): PerformanceMetrics | null {
    const keys = Array.from(this.metrics.keys());
    if (keys.length === 0) return null;
    
    return this.metrics.get(keys[keys.length - 1]) || null;
  }

  /**
   * Get performance history
   */
  static getMetricsHistory(limit: number = 100): PerformanceMetrics[] {
    const keys = Array.from(this.metrics.keys()).slice(-limit);
    return keys.map(key => this.metrics.get(key)!).filter(Boolean);
  }

  /**
   * Get active alerts
   */
  static getActiveAlerts(): PerformanceAlert[] {
    // Return alerts from the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.alerts.filter(alert => alert.timestamp > oneHourAgo);
  }

  /**
   * Get performance recommendations
   */
  static getRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.getCurrentMetrics();
    
    if (!metrics) return recommendations;

    if (metrics.bundleSize > this.thresholds.bundleSize) {
      recommendations.push('Implement code splitting to reduce bundle size');
      recommendations.push('Remove unused dependencies and optimize imports');
    }

    if (metrics.loadTime > this.thresholds.loadTime) {
      recommendations.push('Enable lazy loading for heavy components');
      recommendations.push('Optimize images and implement CDN');
    }

    if (metrics.apiResponseTime > this.thresholds.responseTime) {
      recommendations.push('Add database query optimization');
      recommendations.push('Implement Redis caching for frequent queries');
    }

    if (metrics.errorRate > this.thresholds.errorRate) {
      recommendations.push('Review error logs and fix critical issues');
      recommendations.push('Implement better error handling and retry logic');
    }

    const memoryUsagePercent = metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal;
    if (memoryUsagePercent > this.thresholds.memoryUsage) {
      recommendations.push('Optimize memory usage and implement memory leak detection');
      recommendations.push('Consider scaling up server resources');
    }

    return recommendations;
  }

  /**
   * Generate performance report
   */
  static generateReport(): {
    summary: PerformanceMetrics;
    alerts: PerformanceAlert[];
    recommendations: string[];
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
  } {
    const metrics = this.getCurrentMetrics();
    const alerts = this.getActiveAlerts();
    const recommendations = this.getRecommendations();
    
    if (!metrics) {
      throw new Error('No metrics available');
    }

    // Calculate performance grade
    let score = 100;
    
    if (metrics.bundleSize > this.thresholds.bundleSize) score -= 15;
    if (metrics.loadTime > this.thresholds.loadTime) score -= 20;
    if (metrics.apiResponseTime > this.thresholds.responseTime) score -= 15;
    if (metrics.errorRate > this.thresholds.errorRate) score -= 25;
    
    const memoryUsagePercent = metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal;
    if (memoryUsagePercent > this.thresholds.memoryUsage) score -= 15;

    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    return {
      summary: metrics,
      alerts,
      recommendations,
      grade,
    };
  }
}
