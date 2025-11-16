import { Request, Response, NextFunction } from 'express';

// ============================================================================
// REQUEST LOGGER MIDDLEWARE
// ============================================================================

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;

    // Color code based on status
    let statusColor = '\x1b[32m'; // Green for 2xx
    if (statusCode >= 400 && statusCode < 500) {
      statusColor = '\x1b[33m'; // Yellow for 4xx
    } else if (statusCode >= 500) {
      statusColor = '\x1b[31m'; // Red for 5xx
    }

    const resetColor = '\x1b[0m';
    const methodColor = '\x1b[36m'; // Cyan for method
    const urlColor = '\x1b[37m'; // White for URL

    console.log(
      `${methodColor}${method}${resetColor} ${urlColor}${originalUrl}${resetColor} ` +
      `${statusColor}${statusCode}${resetColor} - ${duration}ms - ${ip}`
    );
  });

  next();
};

// ============================================================================
// API METRICS COLLECTOR (Optional - for analytics)
// ============================================================================

interface RequestMetrics {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
  userId?: string;
}

const metricsQueue: RequestMetrics[] = [];

export const metricsCollector = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    const metrics: RequestMetrics = {
      method: req.method,
      path: req.route?.path || req.path,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date(),
      userId: (req as any).user?.id,
    };

    metricsQueue.push(metrics);

    // Keep only last 1000 requests in memory
    if (metricsQueue.length > 1000) {
      metricsQueue.shift();
    }
  });

  next();
};

/**
 * Get current metrics (useful for /metrics endpoint)
 */
export const getMetrics = () => {
  const now = Date.now();
  const last5Min = metricsQueue.filter(m =>
    now - m.timestamp.getTime() < 5 * 60 * 1000
  );

  return {
    total: metricsQueue.length,
    last5Minutes: last5Min.length,
    averageResponseTime: last5Min.length > 0
      ? last5Min.reduce((sum, m) => sum + m.duration, 0) / last5Min.length
      : 0,
    statusCodes: last5Min.reduce((acc, m) => {
      acc[m.statusCode] = (acc[m.statusCode] || 0) + 1;
      return acc;
    }, {} as Record<number, number>),
  };
};
