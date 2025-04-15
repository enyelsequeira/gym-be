import { UserType } from '@/db/schema';
import { createMiddleware } from '@/lib/create-app';
import { ApiError, Errors } from '@/lib/error-handling';

export const isAdmin = createMiddleware(async (c, next) => {
  console.log('[Admin Check] Starting admin authorization check');

  try {
    const user = c.get('user');
    if (!user) {
      throw Errors.Unauthorized({ message: 'Authentication required' });
    }

    console.log('[Admin Check] Checking user type:', {
      userId: user.id,
      username: user.username,
      userType: user.type,
    });

    if (user.type !== UserType.ADMIN) {
      throw Errors.Forbidden({ message: 'You are not authorized to perform this action' });
    }
    console.log('[Admin Check] Admin access granted');
    await next();
  } catch (error) {
    if (error instanceof ApiError) {
      console.log('----IS ADMIN---', error);
      throw error;
    }

    console.error('Unexpected error:', error);
    throw Errors.InternalServer();
  }
});
