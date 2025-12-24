/**
 * Frontend Logger Utility
 * Replaces console.log with environment-aware logging
 * Only logs in development mode, silent in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  prefix: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

class Logger {
  private config: LoggerConfig;

  constructor() {
    const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
    
    this.config = {
      enabled: isDev,
      level: isDev ? 'debug' : 'error',
      prefix: '[Haven]'
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled && level !== 'error') return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `${this.config.prefix} [${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args);
    }
  }

  // Group logging for complex operations
  group(label: string): void {
    if (this.config.enabled) {
      console.group(this.formatMessage('info', label));
    }
  }

  groupEnd(): void {
    if (this.config.enabled) {
      console.groupEnd();
    }
  }

  // Performance timing
  time(label: string): void {
    if (this.config.enabled) {
      console.time(`${this.config.prefix} ${label}`);
    }
  }

  timeEnd(label: string): void {
    if (this.config.enabled) {
      console.timeEnd(`${this.config.prefix} ${label}`);
    }
  }

  // Table logging for data
  table(data: unknown): void {
    if (this.config.enabled) {
      console.table(data);
    }
  }
}

// Singleton instance
export const logger = new Logger();

// Default export for convenience
export default logger;
