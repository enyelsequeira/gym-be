import { createUserSchema } from '@/db/schema/user-table';
import type { AppBindings } from '@/lib/types';
import { CreateJsonResponse } from '@/middlewares/create-json-response';
import { asValid, createTypedController } from '@/utils/create-typed-controller';
import type { Context, Env, MiddlewareHandler } from 'hono';
import type { z } from 'zod';

const getUserController = (c: Context<AppBindings>) => {
  const userData = asValid(createUserSchema);

  return CreateJsonResponse<{ id: number; name: string; email: string }>({
    c,
    success: true,
    data: {
      email: 'emo',
      id: 1,
      name: 'emo',
    },
  });
};

// Simple controller with no validation
export const getUsersControllerDemo = createTypedController((c) => {
  const userData = c.req;
  console.log({ userData });

  return CreateJsonResponse<{ id: number; name: string; email: string }>({
    c,
    success: true,
    data: {
      email: 'emo',
      id: 1,
      name: 'emo',
    },
  });
});

// Define valid validation target types
type ValidTarget = 'json' | 'form' | 'query' | 'param' | 'header' | 'cookie';

// Create a complete ValidationTargets type with our JSON schema
type ValidatorTargetWithSchema<T> = {
  json: T;
  form: unknown;
  query: unknown;
  param: unknown;
  header: unknown;
  cookie: unknown;
};

// Extend the Context type to include proper typing for valid method
type ValidatedContext<T> = Context<Env, string, { in: ValidatorTargetWithSchema<T> }> & {
  req: {
    valid: (target: ValidTarget) => T;
  };
};

export function defineController<TSchema extends z.ZodType>(
  schema: TSchema,
  handler: (c: ValidatedContext<z.infer<TSchema>>) => Promise<unknown>
) {
  return handler as MiddlewareHandler;
}

export const CreateUserController = defineController(createUserSchema, async (c) => {
  const userData = c.req.valid('json');

  console.log({ userData });
  return CreateJsonResponse<{ id: number; name: string; email: string }>({
    c,
    success: true,
    data: {
      email: 'emo',
      id: 1,
      name: 'emo',
    },
  });
});
