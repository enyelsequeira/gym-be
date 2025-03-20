import type { AppBindings } from '@/lib/types';
import type { Context } from 'hono';
import type { ZodSchema, z } from 'zod';

interface ContextWithValidation<T extends Record<string, any>> extends Context<AppBindings> {
  req: {
    valid: <K extends keyof T>(target: K) => T[K];
  } & Context<AppBindings>['req'];
}

export function createTypedController(
  handler: (c: Context<AppBindings>) => Response | Promise<Response>
) {
  return handler;
}

export function asValid<Schema extends ZodSchema>(schema: Schema) {
  return (data: unknown) => data as z.infer<Schema>;
}

export function createTypedControllerD<ValidationSchema = {}>(
  handler: (
    c: ContextWithValidation<{
      json: ValidationSchema;
    }>
  ) => Response | Promise<Response>
) {
  return handler as (c: Context<AppBindings>) => Promise<Response> | Response;
}
