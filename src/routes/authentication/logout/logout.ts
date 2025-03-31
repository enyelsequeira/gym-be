import { HTTP } from '@/error-code-and-message';
import { factory } from '@/lib/create-app';
import { ApiError, Errors } from '@/lib/error-handling';
import { invalidateAllUserSessions } from '@/lib/session/create-session';
import { CustomValidator } from '@/middlewares/custom-validator';
import { isUserAuthenticated } from '@/middlewares/is-user-authenticated';
import { createJsonResponse } from '@/utils/create-json-response';
import { z } from 'zod';

export const logout = factory.createHandlers(
  CustomValidator('param', z.object({ id: z.string().min(1).max(100) }), '/logout'),
  isUserAuthenticated,
  async (c) => {
    try {
      const params = c.req.valid('param');
      console.log('[Logout] Request params:', {
        userid: params.id,
        url: c.req.url,
        method: c.req.method,
        cookies: c.req.header('cookie'),
      });
      const authenticatedUser = c.get('user');
      if (!authenticatedUser) {
        throw Errors.Unauthorized({
          message: 'Authentication required',
        });
      }
      const targetUserId = Number(params.id);
      if (Number.isNaN(targetUserId)) {
        console.log('[Logout] Invalid user ID format');
        throw Errors.BadRequest({
          message: 'Authentication required',
        });
      }
      if (targetUserId !== authenticatedUser.id) {
        console.log('[Logout] Unauthorized logout attempt:', {
          authenticatedUserId: authenticatedUser.id,
          targetUserId,
        });
        throw Errors.Forbidden({
          message: 'You can only logout from your own account',
        });
      }
      await invalidateAllUserSessions(c, authenticatedUser.id);
      return createJsonResponse({
        c,
        message: 'You have been logged out',
        statusCode: HTTP.Codes.OK,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        console.log('----LOGIN USER OUT---', error);
        throw error;
      }
      console.error('Unexpected error:', error);
      throw Errors.InternalServer();
    }
  }
);
