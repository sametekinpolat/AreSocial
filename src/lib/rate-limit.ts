import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis, { RedisOptions } from 'ioredis';

function buildRedisOptions(): RedisOptions {
  const commonOptions: RedisOptions = {
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
  };

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return {
      ...commonOptions,
      host: '127.0.0.1',
      port: 6379,
    };
  }

  try {
    const parsed = new URL(redisUrl);
    const dbFromPath = parsed.pathname && parsed.pathname !== '/'
      ? Number(parsed.pathname.slice(1))
      : undefined;

    return {
      ...commonOptions,
      host: parsed.hostname || '127.0.0.1',
      port: parsed.port ? Number(parsed.port) : 6379,
      username: parsed.username || undefined,
      password: parsed.password || undefined,
      db: Number.isNaN(dbFromPath) ? undefined : dbFromPath,
      ...(parsed.protocol === 'rediss:' ? { tls: {} } : {}),
    };
  } catch {
    return {
      ...commonOptions,
      host: '127.0.0.1',
      port: 6379,
    };
  }
}

const redisClient = new Redis(buildRedisOptions());
let redisReady = false;
let loggedRedisUnavailable = false;

function getErrorMessage(reason: unknown) {
  if (reason instanceof Error) return reason.message;
  return String(reason);
}

function logRedisUnavailableOnce(reason?: unknown) {
  if (!loggedRedisUnavailable) {
    const suffix = reason ? ` Reason: ${getErrorMessage(reason)}` : '';
    console.warn(`WARNING: Rate limiting skipped because local Redis is offline or unreachable.${suffix}`);
    loggedRedisUnavailable = true;
  }
}

redisClient.on('error', () => {
  redisReady = false;
});

redisClient.on('ready', () => {
  redisReady = true;
  loggedRedisUnavailable = false;
});

redisClient.on('close', () => {
  redisReady = false;
});

async function ensureRedisReady() {
  if (redisReady) return true;

  try {
    if (redisClient.status === 'wait') {
      await redisClient.connect();
    }

    if (!redisReady) {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error('Redis ready timeout'));
        }, 1500);

        const onReady = () => {
          redisReady = true;
          cleanup();
          resolve();
        };

        const onError = (error: Error) => {
          cleanup();
          reject(error);
        };

        const cleanup = () => {
          clearTimeout(timeout);
          redisClient.off('ready', onReady);
          redisClient.off('error', onError);
        };

        redisClient.once('ready', onReady);
        redisClient.once('error', onError);
      });
    }

    await redisClient.ping();
    redisReady = true;
    loggedRedisUnavailable = false;
    return true;
  } catch (error) {
    logRedisUnavailableOnce(error);
    return false;
  }
}

// Allow 5 login attempts per 1 minute
export const loginRateLimit = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'login',
  points: 5,
  duration: 60, 
  inMemoryBlockOnConsumed: 6,
});

// Allow 3 registration attempts per 10 minutes
export const registerRateLimit = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'register',
  points: 3,
  duration: 600, // 10 minutes
  inMemoryBlockOnConsumed: 4,
});

// Allow 1 resend verification email per 5 minutes
export const emailRateLimit = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'email_resend',
  points: 1,
  duration: 300,
});

// Helper function to handle rate limits
export async function checkRateLimit(
  limiter: RateLimiterRedis, 
  identifier: string
) {
  const isRedisAvailable = await ensureRedisReady();
  if (!isRedisAvailable) {
    return { success: true };
  }

  try {
    await limiter.consume(identifier, 1);
    return { success: true };
  } catch (rejection) {
    
    if (rejection instanceof Error) {
      logRedisUnavailableOnce();
      return { success: true }; 
    }
    // Rate limit hit
    return { success: false };
  }
}

