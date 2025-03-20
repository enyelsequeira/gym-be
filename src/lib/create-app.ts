import type { AppBindings } from '@/lib/types';
import { createLogger } from '@/middlewares/logger';
import notFound from '@/middlewares/not-found';
import { OwnRateLimiter } from '@/middlewares/rate-limier';
import { Hono } from 'hono';

export function CreateRouter() {
  return new Hono<AppBindings>({
    strict: false,
  });
}

export default function CreateApp() {
  const app = CreateRouter();
  app.use(createLogger());
  app.use(OwnRateLimiter);
  app.notFound(notFound);

  return app;
}
