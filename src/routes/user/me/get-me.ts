import db from '@/db';
import { HTTP } from '@/error-code-and-message';
import { factory } from '@/lib/create-app';
import { ApiError, Errors } from '@/lib/error-handling';
import { isUserAuthenticated } from '@/middlewares/is-user-authenticated';
import { createJsonResponse } from '@/utils/create-json-response';

export const GetMe = factory.createHandlers(isUserAuthenticated, async (c) => {
  try {
    const contextUser = c.get('user');
    if (!contextUser) {
      throw Errors.BadRequest({
        message: 'Sorry something went wrong',
      });
    }
    console.log('[GetMe] Getting user details for:', {
      userId: contextUser.id,
      username: contextUser.username,
    });
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, contextUser.id),
    });
    if (!user) {
      console.log('[GetMe] User not found in database');
      throw Errors.Unauthorized({
        message: 'Sorry Not Authorized to See this',
      });
    }
    const { password: _, ...userWithoutPass } = user;
    return createJsonResponse({
      c,
      data: userWithoutPass,
      message: HTTP.Phrases.OK,
      statusCode: HTTP.Codes.OK,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      console.log('----FGETTING ME---', error);
      throw error;
    }

    console.error('Unexpected error:', error);
    throw Errors.InternalServer();
  }
});
