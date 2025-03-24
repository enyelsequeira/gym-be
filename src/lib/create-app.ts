import { Errors } from '@/lib/error-handling';
import type { AppBindings } from '@/lib/types';
import { errorHandler } from '@/middlewares/error-handler';
import notFound from '@/middlewares/not-found';
import { OwnRateLimiter } from '@/middlewares/rate-limier';
import { Hono } from 'hono';
import { createFactory } from 'hono/factory';

export function CreateRouter() {
  return new Hono<AppBindings>({
    strict: false,
  });
}

export default function CreateApp() {
  const app = CreateRouter();
  app.use(errorHandler);
  // app.use(createLogger());
  app.use(OwnRateLimiter);
  app.notFound(notFound);
  app.get('/test-error', () => {
    throw Errors.Conflict({
      message: 'Test conflict error',
      errorCode: 'test_conflict',
    });
  });

  return app;
}

export const factory = createFactory<AppBindings>({
  defaultAppOptions: { strict: false },
  initApp: (app) => {
    // Apply global middlewares
    app.use(errorHandler);
    // app.use(createLogger());
    // app.use(OwnRateLimiter);
    app.notFound(notFound);
    app.get('/test-error', () => {
      throw Errors.Conflict({
        message: 'Test conflict error',
        errorCode: 'test_conflict',
      });
    });
  },
});

export const createMiddleware = factory.createMiddleware;
export const createHandlers = factory.createHandlers;
export const createApp = factory.createApp;
