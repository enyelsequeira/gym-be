import { HTTP } from '@/error-code-and-message';
import type { NotFoundHandler } from 'hono';

const notFound: NotFoundHandler = (c) => {
  return c.json(
    {
      message: `${HTTP.Phrases.NOT_FOUND} - ${c.req.path} Does not exist`,
    },
    HTTP.Codes.NOT_FOUND
  );
};

export default notFound;
