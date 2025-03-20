import type { AppBindings } from '@/lib/types';
import { CreateJsonResponse } from '@/middlewares/create-json-response';
import { createTypedController } from '@/utils/create-typed-controller';
import type { Context } from 'hono';

const getUserController = (c: Context<AppBindings>) => {
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
