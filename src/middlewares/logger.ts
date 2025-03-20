import { pinoLogger as honoPinoLogger } from 'hono-pino';
import { pino } from 'pino';
import pretty from 'pino-pretty';
import env from '../../env.js';

export function createLogger() {
  return honoPinoLogger({
    pino: pino(
      {
        level: env.LOG_LEVEL || 'info',
      },
      env.NODE_ENV === 'production' ? undefined : pretty()
    ),

    http: {
      referRequestIdKey: 'requestId',
      responseTime: true,
      onResLevel: (c) => {
        const status = c.res.status;
        if (status >= 500) return 'error';
        if (status >= 400) return 'warn';
        return 'info';
      },
    },
  });
}
