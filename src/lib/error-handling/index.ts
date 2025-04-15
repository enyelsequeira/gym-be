import { HTTP } from '@/error-code-and-message';
import { HTTPException } from 'hono/http-exception';

// Define the error options type
type ErrorOptions = {
  message: string;
  errorCode?: string;
  details?: any;
};

export class ApiError extends HTTPException {
  public message: string;
  public statusCode: number;
  public errorCode?: string;
  public details?: any;

  constructor(statusCode: number, options: ErrorOptions) {
    const { message, errorCode, details } = options;

    super(statusCode as any, {
      message,
      res: new Response(
        JSON.stringify({
          success: false,
          errorMessage: message,
          errorCode: statusCode,
          details,
        }),
        {
          status: statusCode,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      ),
    });

    this.message = message;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.name = 'ApiError';
  }
}

// Error factory object
export const Errors = {
  // Conflict error (409)
  Conflict: (options: ErrorOptions) =>
    new ApiError(HTTP.Codes.CONFLICT, {
      ...options,
      errorCode: options.errorCode || HTTP.Phrases.CONFLICT,
    }),

  // Bad request error (400)
  BadRequest: (options: ErrorOptions) =>
    new ApiError(HTTP.Codes.BAD_REQUEST, {
      ...options,
      errorCode: options.errorCode || HTTP.Phrases.BAD_REQUEST,
    }),

  // Not found error (404)
  NotFound: (options: ErrorOptions) =>
    new ApiError(HTTP.Codes.NOT_FOUND, {
      ...options,
      errorCode: options.errorCode || HTTP.Phrases.NOT_FOUND,
    }),

  // Unauthorized error (401)
  Unauthorized: (options: ErrorOptions) =>
    new ApiError(HTTP.Codes.UNAUTHORIZED, {
      ...options,
      errorCode: options.errorCode || HTTP.Phrases.UNAUTHORIZED,
    }),

  // Forbidden error (403)
  Forbidden: (options: ErrorOptions) =>
    new ApiError(HTTP.Codes.FORBIDDEN, {
      ...options,
      errorCode: options.errorCode || HTTP.Phrases.FORBIDDEN,
    }),

  // Internal server error (500)
  InternalServer: (options: ErrorOptions = { message: 'Internal Server Error' }) =>
    new ApiError(HTTP.Codes.INTERNAL_SERVER_ERROR, {
      ...options,
      errorCode: options.errorCode || HTTP.Phrases.INTERNAL_SERVER_ERROR,
    }),
};
