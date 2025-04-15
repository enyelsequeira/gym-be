import db from '@/db';
import { createMiddleware } from '@/lib/create-app';
/**
 * Authentication middleware that:
 * 1. Validates the session cookie
 * 2. Retrieves the user's session from database
 * 3. Sets user info in request context
 */
import { Errors } from '@/lib/error-handling';
import {
  SESSION_COOKIE_NAME,
  generateSessionId,
  validateSessionToken,
} from '@/lib/session/create-session';
import type { AuthContext } from '@/lib/types';
import { getCookie } from 'hono/cookie';

export const isUserAuthenticated = createMiddleware(async (c, next) => {
  console.log('\n[Auth] Starting authentication check');
  try {
    const rawCookie = getCookie(c, SESSION_COOKIE_NAME);
    if (!rawCookie) {
      throw Errors.Unauthorized({ message: 'Please login to continue' });
    }
    const [token] = rawCookie.split('.');
    console.log('[Auth] Found session token:', `${token.substring(0, 8)}...`);

    const isValid = await validateSessionToken(c);
    if (!isValid) {
      console.log('[Auth] Invalid session signature');
      throw Errors.Unauthorized({ message: 'Please login to continue' });
    }

    const sessionId = generateSessionId(token);

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.id, sessionId),
      with: {
        user: true,
      },
    });

    if (!session) {
      console.log('[Auth] No valid session found in database');
      throw Errors.Unauthorized({ message: 'Please login to continue' });
    }
    console.log('[Auth] Found valid session:', {
      sessionId: `${session.id.substring(0, 8)}...`,
      userId: session.userId,
      expiresAt: session.expiresAt,
    });

    const authContext: AuthContext = {
      user: {
        id: session.user.id,
        username: session.user.username,
        type: session.user.type,
      },
      session,
    };
    c.set('user', authContext.user);
    c.set('session', authContext.session);

    console.log('[Auth] Successfully authenticated user:', {
      userId: authContext.user.id,
      username: authContext.user.username,
    });
    await next();
  } catch (error) {
    console.error('[Auth] Authentication error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    throw Errors.Unauthorized({ message: 'Please login to continue' });
  }
});
