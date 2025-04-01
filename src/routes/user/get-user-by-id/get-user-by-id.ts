import db from '@/db';
import { users } from '@/db/schema';
import { HTTP } from '@/error-code-and-message';
import { factory } from '@/lib/create-app';
import { ApiError, Errors } from '@/lib/error-handling';
import { CustomValidator } from '@/middlewares/custom-validator';
import { isAdmin } from '@/middlewares/is-admin';
import { isUserAuthenticated } from '@/middlewares/is-user-authenticated';
import { createJsonResponse } from '@/utils/create-json-response';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const getUserById = factory.createHandlers(
  CustomValidator('param', z.object({ id: z.string() }), '/user/:id'),
  isUserAuthenticated,
  isAdmin,
  async (c) => {
    try {
      const query = c.req.valid('param');
      const targetId = Number(query.id);
      const user = await db.query.users.findFirst({
        where: eq(users.id, targetId),
      });

      if (!user) {
        throw Errors.NotFound({ message: 'User not found' });
      }
      const { password: _, ...rest } = user;
      return createJsonResponse({
        c,
        data: rest,
        message: HTTP.Phrases.OK,
        statusCode: HTTP.Codes.OK,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        console.log('----FETCHING SPECIFIC---', error);
        throw error;
      }

      console.error('Unexpected error:', error);
      throw Errors.InternalServer();
    }
  }
);
