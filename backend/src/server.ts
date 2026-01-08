import { createServer } from 'http';
import app from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { websocketService } from './services/websocket.service';
import { logger } from './utils/logger';
import 'dotenv/config';

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('✅ Database connected successfully');

    // Connect to Redis (optional - continue if Redis fails)
    try {
      await connectRedis();
      logger.info('✅ Redis connected successfully');
    } catch (redisError) {
      logger.warn('⚠️ Redis connection failed - some features may be limited:', redisError);
      // Don't throw - Redis is optional for basic functionality
    }

    // Create HTTP server from Express app
    const httpServer = createServer(app);

    // Initialize WebSocket server
    websocketService.initialize(httpServer);
    logger.info('🔌 WebSocket server initialized');

    // Start HTTP server
    const server = httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${NODE_ENV}`);
      logger.info(`🔗 API: http://localhost:${PORT}/api/v1`);
      logger.info(`💚 Health: http://localhost:${PORT}/api/v1/health`);
      logger.info(`🔌 WebSocket: ws://localhost:${PORT}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, closing server gracefully...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          // Shutdown WebSocket server
          websocketService.shutdown();
          logger.info('WebSocket server closed');

          // Disconnect Redis
          await disconnectRedis();
          logger.info('Redis connection closed');

          await disconnectDatabase();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    logger.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
