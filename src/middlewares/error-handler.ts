import { ApiError } from '@/lib/error-handling';
import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.log('Error handler caught:', error);

    if (error instanceof ApiError || error instanceof HTTPException) {
      throw error;
    }

    // Handle unexpected errors
    console.error('Unhandled error:', error);
    throw new HTTPException(500, {
      message: 'Internal server error',
      res: new Response(
        JSON.stringify({
          success: false,
          errorMessage: 'Internal server error',
          errorCode: 500,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      ),
    });
  }
};
