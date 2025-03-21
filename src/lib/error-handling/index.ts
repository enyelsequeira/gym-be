import {
  BAD_REQUEST,
  CONFLICT,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
} from '@/utils/http-status-codes';
import { HTTPException } from 'hono/http-exception';

import {
  BAD_REQUEST as BAD_REQUEST_MESSAGE,
  CONFLICT as CONFLICT_MESSAGE,
  FORBIDDEN as FORBIDDEN_MESSAGE,
  INTERNAL_SERVER_ERROR as INTERNAL_SERVER_ERROR_MESSAGE,
  NOT_FOUND as NOT_FOUND_MESSAGE,
  UNAUTHORIZED as UNAUTHORIZED_MESSAGE,
} from '@/utils/http-status-phrases';

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
    new ApiError(CONFLICT, {
      ...options,
      errorCode: options.errorCode || CONFLICT_MESSAGE,
    }),

  // Bad request error (400)
  BadRequest: (options: ErrorOptions) =>
    new ApiError(BAD_REQUEST, {
      ...options,
      errorCode: options.errorCode || BAD_REQUEST_MESSAGE,
    }),

  // Not found error (404)
  NotFound: (options: ErrorOptions) =>
    new ApiError(NOT_FOUND, {
      ...options,
      errorCode: options.errorCode || NOT_FOUND_MESSAGE,
    }),

  // Unauthorized error (401)
  Unauthorized: (options: ErrorOptions) =>
    new ApiError(UNAUTHORIZED, {
      ...options,
      errorCode: options.errorCode || UNAUTHORIZED_MESSAGE,
    }),

  // Forbidden error (403)
  Forbidden: (options: ErrorOptions) =>
    new ApiError(FORBIDDEN, {
      ...options,
      errorCode: options.errorCode || FORBIDDEN_MESSAGE,
    }),

  // Internal server error (500)
  InternalServer: (options: ErrorOptions = { message: 'Internal Server Error' }) =>
    new ApiError(INTERNAL_SERVER_ERROR, {
      ...options,
      errorCode: options.errorCode || INTERNAL_SERVER_ERROR_MESSAGE,
    }),
};
