import { redisClient, connectRedis, disconnectRedis } from '../config/redis';
import { logger } from '../utils/logger';
import 'dotenv/config';

async function flushCache() {
  try {
    logger.info('Connecting to Redis...');
    await connectRedis();

    logger.info('Flushing all keys from Redis...');
    await redisClient.flushAll();
    
    logger.info('✅ Redis cache flushed successfully.');
  } catch (error) {
    logger.error('❌ Failed to flush Redis cache:', error);
    process.exit(1);
  } finally {
    await disconnectRedis();
    process.exit(0);
  }
}

flushCache();
