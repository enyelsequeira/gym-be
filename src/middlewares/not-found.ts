import { NOT_FOUND, NOT_FOUND as NOT_FOUND_MESSAGE } from '@/utils/http-status-codes';
import type { NotFoundHandler } from 'hono';

const notFound: NotFoundHandler = (c) => {
  return c.json(
    {
      message: `${NOT_FOUND_MESSAGE} - ${c.req.path} Does not exist`,
    },
    NOT_FOUND
  );
};

export default notFound;
