import type { MiddlewareHandler } from 'hono';
import { type ConfigType, type GeneralConfigType, rateLimiter } from 'hono-rate-limiter';
// Custom rate limiter wrapper with correct typing

export const CustomRateLimiter = (
  options: GeneralConfigType<ConfigType> & {
    apiPoint: string;
    errorMessage?: string;
  }
): MiddlewareHandler => {
  const { apiPoint, errorMessage, ...rateLimiterOptions } = options;

  // Create the standard rate limiter with the provided options
  return rateLimiter({
    ...rateLimiterOptions,
    // Override the handler to provide a consistent response format
    handler: (c, next) => {
      // Get headers that would be set by the rate limiter
      const remaining = c.res.headers.get('RateLimit-Remaining');
      const limit = c.res.headers.get('RateLimit-Limit');
      const reset = c.res.headers.get('RateLimit-Reset');
      // Calculate time until reset
      const resetTime = reset
        ? new Date(Number.parseInt(reset) * 1000)
        : new Date(Date.now() + 60000);
      const msBeforeNext = resetTime.getTime() - Date.now();

      return c.json(
        {
          success: false,
          message:
            errorMessage ||
            `Rate limit exceeded. Try again after ${resetTime.toLocaleTimeString()}`,
          details: {
            limit: limit ? Number.parseInt(limit) : options.limit,
            remaining: remaining ? Number.parseInt(remaining) : 0,
            reset: reset ? Number.parseInt(reset) : Math.floor(resetTime.getTime() / 1000),
            msBeforeNext: msBeforeNext,
          },
          apiPoint,
        },
        429
      );
    },
  });
};

// Use the custom rate limiter
export const OwnRateLimiter = CustomRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 5, // Limit each IP to 5 requests per minute
  standardHeaders: 'draft-6', // Adds rate limit headers to responses
  keyGenerator: (c) => c.req.header('x-forwarded-for') || c.req.method || 'unknown',
  apiPoint: '/demo',
  errorMessage: 'Too many requests to the demo endpoint. Please try again later.',
});
