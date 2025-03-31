import db from '@/db';
import { HTTP } from '@/error-code-and-message';
import { factory } from '@/lib/create-app';
import { ApiError, Errors } from '@/lib/error-handling';
import { createSession, generateSessionToken } from '@/lib/session/create-session';
import { CustomValidator } from '@/middlewares/custom-validator';
import { verifyPassword } from '@/routes/user/utils/hash-password';
import { createJsonResponse } from '@/utils/create-json-response';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
});

export const login = factory.createHandlers(
  CustomValidator('json', loginSchema, '/login'),
  async (c) => {
    try {
      const { username, password } = c.req.valid('json');
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.username, username),
      });
      if (!user || !verifyPassword(user.password, password)) {
        throw Errors.NotFound({
          message: 'Username or Password invalid',
        });
      }
      const token = generateSessionToken();
      //creates session and set cookie
      const session = await createSession(c, token, user.id);
      console.log('[Login] Session created:', session);
      console.log('[Login] Cookie being set:', token);

      const { password: _password, ...userWithoutPassword } = user;
      return createJsonResponse({
        c,
        message: 'You have been logged in',
        data: userWithoutPassword,
        statusCode: HTTP.Codes.OK,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        console.log('----LOGIN USER IN---', error);
        throw error;
      }

      console.error('Unexpected error:', error);
      throw Errors.InternalServer();
    }
  }
);
