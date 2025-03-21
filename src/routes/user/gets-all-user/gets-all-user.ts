import { factory } from '@/lib/create-app';

export const getUsersHandler = factory.createHandlers((c) => {
  return c.json({
    message: 'Hello All Users',
  });
});
