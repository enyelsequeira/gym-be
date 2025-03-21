import { createJsonResponse } from '@/middlewares/create-json-response';
import { CustomValidator } from '@/middlewares/custom-validator';
import type { RouterType } from '@/utils/create-typed-controller';
import { z } from 'zod';

export function getUserById(router: RouterType) {
  router.get(
    '/user/:id',
    CustomValidator('param', z.object({ id: z.string() }), '/user/:id'),
    (c) => {
      const userData = c.req.valid('param');
      return createJsonResponse<{ id: number; name: string; email: string }>({
        c,
        success: true,
        data: {
          email: 'emo',
          id: 1,
          name: 'emo',
        },
      });
    }
  );

  return router;
}
