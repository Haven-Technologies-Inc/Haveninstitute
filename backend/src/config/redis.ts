import { createClient } from 'redis';
import { logger } from '../utils/logger';

// Redis client configuration
// Support both REDIS_URL and REDIS_HOST/REDIS_PORT/REDIS_PASSWORD formats
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';
const redisPassword = process.env.REDIS_PASSWORD;

// Construct Redis URL from individual components if REDIS_URL not provided
const redisUrl = process.env.REDIS_URL ||
  (redisPassword
    ? `redis://:${redisPassword}@${redisHost}:${redisPort}`
    : `redis://${redisHost}:${redisPort}`);

export const redisClient = createClient({
  url: redisUrl,
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('Redis max reconnection attempts reached');
        return new Error('Max reconnection attempts reached');
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

// Redis connection events
redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
  logger.error('Redis client error:', err);
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

redisClient.on('end', () => {
  logger.info('Redis client disconnected');
});

// Connect to Redis
export async function connectRedis() {
  try {
    await redisClient.connect();
    logger.info('Redis connection established');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
}

// Disconnect from Redis
export async function disconnectRedis() {
  try {
    await redisClient.disconnect();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
}

// Redis utility functions
export const redisUtils = {
  // Set key with expiration
  async setWithExpire(key: string, value: string, ttl: number): Promise<void> {
    await redisClient.setEx(key, ttl, value);
  },

  // Get value by key
  async get(key: string): Promise<string | null> {
    return await redisClient.get(key);
  },

  // Delete key
  async del(key: string): Promise<number> {
    return await redisClient.del(key);
  },

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    const result = await redisClient.exists(key);
    return result === 1;
  },

  // Increment counter
  async incr(key: string): Promise<number> {
    return await redisClient.incr(key);
  },

  // Set hash field
  async hSet(key: string, field: string, value: string): Promise<number> {
    return await redisClient.hSet(key, field, value);
  },

  // Get hash field
  async hGet(key: string, field: string): Promise<string | undefined> {
    return await redisClient.hGet(key, field);
  },

  // Get all hash fields
  async hGetAll(key: string): Promise<Record<string, string>> {
    return await redisClient.hGetAll(key);
  },

  // Add to set
  async sAdd(key: string, member: string): Promise<number> {
    return await redisClient.sAdd(key, member);
  },

  // Check if member exists in set
  async sIsMember(key: string, member: string): Promise<boolean> {
    return await redisClient.sIsMember(key, member);
  },

  // Get all set members
  async sMembers(key: string): Promise<string[]> {
    return await redisClient.sMembers(key);
  }
};

export default redisClient;
