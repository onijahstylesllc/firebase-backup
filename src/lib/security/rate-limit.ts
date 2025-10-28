import { LRUCache } from 'lru-cache';

export interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface CacheValue {
  count: number;
  resetTime: number;
}

const rateLimitCache = new LRUCache<string, CacheValue>({
  max: 500, // Maximum number of keys to store
  ttl: 60000, // 1 minute default TTL
});

export function rateLimit(config: RateLimitConfig = {
  interval: 60000, // 1 minute
  uniqueTokenPerInterval: 10, // 10 requests per minute
}) {
  return {
    check: (identifier: string): RateLimitResult => {
      const now = Date.now();
      const cached = rateLimitCache.get(identifier);
      
      if (!cached) {
        // First request
        const resetTime = now + config.interval;
        rateLimitCache.set(identifier, { count: 1, resetTime }, { ttl: config.interval });
        
        return {
          success: true,
          limit: config.uniqueTokenPerInterval,
          remaining: config.uniqueTokenPerInterval - 1,
          reset: resetTime,
        };
      }
      
      // Check if the interval has passed
      if (now >= cached.resetTime) {
        // Reset the counter
        const resetTime = now + config.interval;
        rateLimitCache.set(identifier, { count: 1, resetTime }, { ttl: config.interval });
        
        return {
          success: true,
          limit: config.uniqueTokenPerInterval,
          remaining: config.uniqueTokenPerInterval - 1,
          reset: resetTime,
        };
      }
      
      // Increment the counter
      if (cached.count < config.uniqueTokenPerInterval) {
        cached.count++;
        rateLimitCache.set(identifier, cached, { ttl: cached.resetTime - now });
        
        return {
          success: true,
          limit: config.uniqueTokenPerInterval,
          remaining: config.uniqueTokenPerInterval - cached.count,
          reset: cached.resetTime,
        };
      }
      
      // Rate limit exceeded
      return {
        success: false,
        limit: config.uniqueTokenPerInterval,
        remaining: 0,
        reset: cached.resetTime,
      };
    },
  };
}

// Pre-configured limiters for different endpoints
export const chatRateLimiter = rateLimit({
  interval: 60000, // 1 minute
  uniqueTokenPerInterval: 20, // 20 requests per minute
});

export const translateRateLimiter = rateLimit({
  interval: 60000, // 1 minute
  uniqueTokenPerInterval: 15, // 15 requests per minute
});

export const rewriteRateLimiter = rateLimit({
  interval: 60000, // 1 minute
  uniqueTokenPerInterval: 15, // 15 requests per minute
});
