import type { Context } from 'hono';

export const CreateJsonResponse = <T = unknown>({
  c,
  success,
  data,
}: {
  c: Context;
  success: boolean;
  data?: T;
}) => {
  return c.json({
    success,
    data,
  });
};
