import type { AppBindings } from '@/lib/types';
import type { Context } from 'hono';

export function createTypedController(
  handler: (c: Context<AppBindings>) => Response | Promise<Response>
) {
  return handler;
}
